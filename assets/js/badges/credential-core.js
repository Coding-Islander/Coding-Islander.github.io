/**
 * Coding Islander - credential lookup and LinkedIn link building.
 *
 * DOM-free on purpose so the badge pages and the verification page share the exact
 * same verification rules. The credential ID is the only source of truth: nothing
 * about the participant or the workshop is ever read from the URL.
 */
(function (global) {
    'use strict';

    var config = global.CI_CREDENTIAL_CONFIG;

    var STATE = {
        ACTIVE: 'active',
        REVOKED: 'revoked',
        NOT_FOUND: 'not-found',
        INVALID_FORMAT: 'invalid-format',
        ERROR: 'error'
    };

    var registryPromise = null;

    function normalizeCredentialId(raw) {
        return String(raw === null || raw === undefined ? '' : raw).trim().toUpperCase();
    }

    function isValidCredentialIdFormat(id) {
        return config.CREDENTIAL_ID_PATTERN.test(id);
    }

    function isPlainObject(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }

    function fetchJson(url) {
        return fetch(url, { cache: 'no-cache' }).then(function (response) {
            if (!response.ok) {
                throw new Error('Request failed with status ' + response.status);
            }
            return response.json();
        });
    }

    function loadRegistry(basePrefix) {
        if (!registryPromise) {
            registryPromise = fetchJson(basePrefix + '/' + config.CREDENTIALS_PATH).catch(function (error) {
                // Drop the cached rejection so a later lookup can retry the fetch.
                registryPromise = null;
                throw error;
            });
        }
        return registryPromise;
    }

    function readOwnRecord(registry, id) {
        // Own-property check stops inherited keys such as "constructor" resolving to a function.
        if (!Object.prototype.hasOwnProperty.call(registry, id)) {
            return null;
        }
        var record = registry[id];
        return isPlainObject(record) ? record : null;
    }

    function readString(value) {
        return typeof value === 'string' ? value.trim() : '';
    }

    /**
     * Resolves a raw (possibly user-typed) credential ID against the public registry.
     * Returns { state, id, credential? } - never throws.
     */
    function lookupCredential(rawId, basePrefix) {
        var id = normalizeCredentialId(rawId);

        if (!isValidCredentialIdFormat(id)) {
            return Promise.resolve({ state: STATE.INVALID_FORMAT, id: id });
        }

        return loadRegistry(basePrefix).then(function (registry) {
            if (!isPlainObject(registry)) {
                console.error('[credentials] registry is not an object');
                return { state: STATE.ERROR, id: id };
            }

            var record = readOwnRecord(registry, id);
            if (!record) {
                return { state: STATE.NOT_FOUND, id: id };
            }

            var participantName = readString(record.participantName);
            var workshopId = readString(record.workshopId);
            var issueDate = readString(record.issueDate);

            if (!participantName || !issueDate || !config.WORKSHOP_SLUG_PATTERN.test(workshopId)) {
                console.error('[credentials] malformed record for', id);
                return { state: STATE.ERROR, id: id };
            }

            // Anything that is not explicitly "active" must never render as verified.
            var status = readString(record.status).toLowerCase();
            var state = STATE.ERROR;
            if (status === 'active') {
                state = STATE.ACTIVE;
            } else if (status === 'revoked') {
                state = STATE.REVOKED;
            }

            return {
                state: state,
                id: id,
                credential: {
                    id: id,
                    participantName: participantName,
                    workshopId: workshopId,
                    issueDate: issueDate
                }
            };
        }).catch(function (error) {
            console.error('[credentials] registry unavailable', error);
            return { state: STATE.ERROR, id: id };
        });
    }

    function loadWorkshop(workshopId, basePrefix) {
        if (!config.WORKSHOP_SLUG_PATTERN.test(workshopId)) {
            return Promise.resolve(null);
        }
        var url = basePrefix + '/' + config.WORKSHOPS_DIR + '/' + workshopId + '.json';
        return fetchJson(url).then(function (data) {
            return isPlainObject(data) ? data : null;
        }).catch(function (error) {
            console.error('[credentials] workshop data unavailable for', workshopId, error);
            return null;
        });
    }

    /** Returns the badge block of a workshop, or null when the workshop issues no badge. */
    function getBadge(workshop) {
        if (!isPlainObject(workshop) || !isPlainObject(workshop.badge) || workshop.badge.enabled === false) {
            return null;
        }
        var badge = workshop.badge;
        return {
            code: readString(badge.code),
            title: readString(badge.title) || readString(workshop.title),
            image: readString(badge.image),
            description: readString(badge.description),
            skills: Array.isArray(badge.skills)
                ? badge.skills.filter(function (skill) { return readString(skill) !== ''; })
                : []
        };
    }

    function parseIssueDate(iso) {
        var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
        if (!match) {
            return null;
        }
        // Built in UTC so the displayed day never shifts with the visitor's timezone.
        var date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
        return isNaN(date.getTime()) ? null : { date: date, year: match[1], month: String(Number(match[2])) };
    }

    function formatIssueDate(iso) {
        var parsed = parseIssueDate(iso);
        if (!parsed) {
            return '';
        }
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
        }).format(parsed.date);
    }

    function buildCredentialUrl(workshopId, credentialId) {
        return config.SITE_ORIGIN + '/badges/' + encodeURIComponent(workshopId) +
            '/?id=' + encodeURIComponent(credentialId);
    }

    /**
     * Legacy LinkedIn "Add to Profile" prefill URL. LinkedIn does not formally document
     * these parameters, so the badge page also exposes a manual copy panel as a fallback.
     */
    function buildAddToProfileUrl(options) {
        var params = new URLSearchParams();
        params.set('startTask', 'CERTIFICATION_NAME');
        params.set('name', options.badgeTitle);

        var orgId = config.LINKEDIN_ORGANIZATION_ID;
        if (orgId && orgId !== 'YOUR_LINKEDIN_ORGANIZATION_ID') {
            params.set('organizationId', orgId);
        } else {
            params.set('organizationName', config.ORGANIZATION_NAME);
        }

        var parsed = parseIssueDate(options.issueDate);
        if (parsed) {
            params.set('issueYear', parsed.year);
            params.set('issueMonth', parsed.month);
        }

        params.set('certUrl', options.credentialUrl);
        params.set('certId', options.credentialId);

        return 'https://www.linkedin.com/profile/add?' + params.toString();
    }

    function buildShareOffsiteUrl(credentialUrl) {
        return 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(credentialUrl);
    }

    function toHashtag(skill) {
        var slug = String(skill).toLowerCase().replace(/#/g, 'sharp').replace(/[^a-z0-9]/g, '');
        return slug ? '#' + slug : '';
    }

    function buildCaption(badgeTitle, skills) {
        var list = Array.isArray(skills) ? skills : [];
        var tags = ['#codingislander'];

        list.forEach(function (skill) {
            var tag = toHashtag(skill);
            if (tag && tags.indexOf(tag) === -1) {
                tags.push(tag);
            }
        });

        var skillSentence = list.length
            ? 'This workshop strengthened my skills in ' + list.join(', ') + '.'
            : 'This workshop gave me hands-on practice I can apply straight away.';

        return '🎉 I\'ve earned the ' + badgeTitle + ' badge from ' + config.ORGANIZATION_NAME + '.\n\n' +
            skillSentence + '\n\n' + tags.join(' ');
    }

    function copyText(text) {
        if (global.navigator.clipboard && global.isSecureContext) {
            return global.navigator.clipboard.writeText(text)
                .then(function () { return true; })
                .catch(function () { return legacyCopy(text); });
        }
        return Promise.resolve(legacyCopy(text));
    }

    // Fallback for non-secure contexts, e.g. a plain-http local preview.
    function legacyCopy(text) {
        var area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.top = '-1000px';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();

        var copied = false;
        try {
            copied = document.execCommand('copy');
        } catch (error) {
            copied = false;
        }
        document.body.removeChild(area);
        return copied;
    }

    global.CICredentials = {
        STATE: STATE,
        normalizeCredentialId: normalizeCredentialId,
        isValidCredentialIdFormat: isValidCredentialIdFormat,
        lookupCredential: lookupCredential,
        loadWorkshop: loadWorkshop,
        getBadge: getBadge,
        formatIssueDate: formatIssueDate,
        buildCredentialUrl: buildCredentialUrl,
        buildAddToProfileUrl: buildAddToProfileUrl,
        buildShareOffsiteUrl: buildShareOffsiteUrl,
        buildCaption: buildCaption,
        copyText: copyText
    };
})(window);
