/**
 * Coding Islander - per-workshop badge page renderer.
 *
 * The page itself is static per workshop (so LinkedIn's crawler sees workshop-specific
 * Open Graph tags). This script only resolves ?id= against the registry and fills in the
 * participant-specific parts. All participant data is written with textContent.
 */
(function () {
    'use strict';

    var core = window.CICredentials;
    var config = window.CI_CREDENTIAL_CONFIG;

    var pageSlug = document.body.dataset.workshopSlug || '';
    var basePrefix = document.body.dataset.basePrefix || '..';

    var els = {
        banner: document.getElementById('credential-banner'),
        bannerIcon: document.getElementById('credential-banner-icon'),
        bannerText: document.getElementById('credential-banner-text'),
        details: document.getElementById('credential-details'),
        participant: document.getElementById('credential-participant'),
        statement: document.getElementById('credential-statement'),
        credentialId: document.getElementById('credential-id'),
        issueDate: document.getElementById('credential-issue-date'),
        skillsWrap: document.getElementById('credential-skills-wrap'),
        skills: document.getElementById('credential-skills'),
        message: document.getElementById('credential-message'),
        actions: document.getElementById('credential-actions'),
        addToProfile: document.getElementById('action-add-linkedin'),
        share: document.getElementById('action-share-linkedin'),
        copyCaption: document.getElementById('action-copy-caption'),
        toggleFallback: document.getElementById('action-toggle-fallback'),
        actionStatus: document.getElementById('action-status'),
        fallback: document.getElementById('credential-fallback'),
        fallbackName: document.getElementById('fallback-name'),
        fallbackOrg: document.getElementById('fallback-org'),
        fallbackIssue: document.getElementById('fallback-issue'),
        fallbackId: document.getElementById('fallback-id'),
        fallbackUrl: document.getElementById('fallback-url'),
        captionWrap: document.getElementById('credential-caption-wrap'),
        caption: document.getElementById('credential-caption'),
        staticTitle: document.getElementById('credential-badge-title'),
        badgeImage: document.getElementById('credential-badge-image')
    };

    var BANNERS = {
        verified: { modifier: 'credential-banner--verified', icon: 'bx bx-check-circle', text: 'Verified Credential' },
        revoked: { modifier: 'credential-banner--revoked', icon: 'bx bx-x-circle', text: 'Credential Revoked' },
        notFound: { modifier: 'credential-banner--notfound', icon: 'bx bx-error-circle', text: 'Credential Not Found' },
        error: { modifier: 'credential-banner--notfound', icon: 'bx bx-error-circle', text: 'Credential Unavailable' }
    };

    function show(element) {
        if (element) { element.classList.remove('is-hidden'); }
    }

    function hide(element) {
        if (element) { element.classList.add('is-hidden'); }
    }

    function setBanner(kind) {
        var banner = BANNERS[kind];
        els.banner.className = 'credential-banner ' + banner.modifier;
        els.bannerIcon.className = banner.icon;
        els.bannerText.textContent = banner.text;
    }

    function showMessage(text) {
        els.message.textContent = text;
        show(els.message);
    }

    function failWith(kind, text) {
        setBanner(kind);
        hide(els.details);
        hide(els.actions);
        hide(els.captionWrap);
        showMessage(text);
    }

    function renderSkills(skills) {
        els.skills.textContent = '';
        if (!skills.length) {
            hide(els.skillsWrap);
            return;
        }
        skills.forEach(function (skill) {
            var item = document.createElement('li');
            item.className = 'credential-skills__chip';
            item.textContent = skill;
            els.skills.appendChild(item);
        });
        show(els.skillsWrap);
    }

    function setStatus(text) {
        els.actionStatus.textContent = text;
    }

    // Accepts both "/assets/..." and "assets/..." so badge.image matches the heroImage convention.
    function resolveAssetPath(path) {
        if (/^https?:\/\//i.test(path)) {
            return path;
        }
        return basePrefix + '/' + path.replace(/^\/+/, '');
    }

    function wireActions(credential, badge, credentialUrl, formattedDate) {
        els.addToProfile.href = core.buildAddToProfileUrl({
            badgeTitle: badge.title,
            issueDate: credential.issueDate,
            credentialId: credential.id,
            credentialUrl: credentialUrl
        });
        els.share.href = core.buildShareOffsiteUrl(credentialUrl);

        var caption = core.buildCaption(badge.title, badge.skills);
        els.caption.textContent = caption;
        show(els.captionWrap);

        els.copyCaption.addEventListener('click', function () {
            core.copyText(caption).then(function (copied) {
                setStatus(copied ? 'Caption copied to your clipboard.' : 'Copy failed - please select the caption below and copy it manually.');
            });
        });

        // LinkedIn cannot be pre-filled with post text, so put the caption on the
        // clipboard as the share window opens and the participant only has to paste.
        els.share.addEventListener('click', function () {
            core.copyText(caption).then(function (copied) {
                setStatus(copied
                    ? 'Caption copied - paste it into the LinkedIn post that just opened.'
                    : 'LinkedIn is opening. Copy the caption below and paste it into your post.');
            });
        });

        els.fallbackName.textContent = badge.title;
        els.fallbackOrg.textContent = config.ORGANIZATION_NAME;
        els.fallbackIssue.textContent = formattedDate;
        els.fallbackId.textContent = credential.id;
        els.fallbackUrl.textContent = credentialUrl;

        els.toggleFallback.addEventListener('click', function () {
            var hidden = els.fallback.classList.toggle('is-hidden');
            els.toggleFallback.setAttribute('aria-expanded', String(!hidden));
        });

        show(els.actions);
    }

    function renderVerified(credential, badge) {
        var formattedDate = core.formatIssueDate(credential.issueDate);
        var credentialUrl = core.buildCredentialUrl(credential.workshopId, credential.id);

        setBanner('verified');
        hide(els.message);

        if (badge.title) {
            els.staticTitle.textContent = badge.title;
        }
        if (badge.image && els.badgeImage) {
            els.badgeImage.src = resolveAssetPath(badge.image);
            els.badgeImage.alt = config.ORGANIZATION_NAME + ' ' + badge.title + ' skills badge';
            show(els.badgeImage);
        }
        els.participant.textContent = credential.participantName;
        els.statement.textContent = 'This credential recognises successful completion of the ' +
            config.ORGANIZATION_NAME + ' ' + badge.title + ' workshop.';
        els.credentialId.textContent = credential.id;
        els.issueDate.textContent = formattedDate;
        renderSkills(badge.skills);
        show(els.details);

        wireActions(credential, badge, credentialUrl, formattedDate);
    }

    function init() {
        var rawId = new URLSearchParams(window.location.search).get('id');

        if (!rawId) {
            failWith('notFound', 'No credential ID was supplied. Use the link from your congratulations email, or look the credential up on the verification page.');
            return;
        }

        core.lookupCredential(rawId, basePrefix).then(function (result) {
            if (result.state === core.STATE.INVALID_FORMAT || result.state === core.STATE.NOT_FOUND) {
                failWith('notFound', 'We could not find a credential with that ID. Check the ID and try again, or use the verification page.');
                return;
            }
            if (result.state === core.STATE.ERROR) {
                failWith('error', 'We could not check this credential right now. Please try again shortly.');
                return;
            }

            // A credential only renders on the badge page of the workshop that issued it.
            if (result.credential.workshopId !== pageSlug) {
                failWith('notFound', 'We could not find a credential with that ID on this page. Use the verification page to look it up.');
                return;
            }

            if (result.state === core.STATE.REVOKED) {
                failWith('revoked', 'This credential has been revoked by ' + config.ORGANIZATION_NAME + ' and is no longer valid.');
                return;
            }

            return core.loadWorkshop(result.credential.workshopId, basePrefix).then(function (workshop) {
                var badge = core.getBadge(workshop);
                if (!badge) {
                    failWith('error', 'Badge details for this workshop are unavailable. Please try again shortly.');
                    return;
                }
                renderVerified(result.credential, badge);
            });
        });
    }

    init();
})();
