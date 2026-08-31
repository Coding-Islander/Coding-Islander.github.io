/**
 * Coding Islander - public credential verification page.
 * Reuses credential-core so the verification rules match the badge pages exactly.
 */
(function () {
    'use strict';

    var core = window.CICredentials;
    var basePrefix = document.body.dataset.basePrefix || '..';

    var form = document.getElementById('verify-form');
    var input = document.getElementById('verify-input');
    var result = document.getElementById('verify-result');
    var submit = document.getElementById('verify-submit');

    function clearResult() {
        result.textContent = '';
    }

    function buildBanner(modifier, icon, text) {
        var banner = document.createElement('p');
        banner.className = 'credential-banner ' + modifier;

        var iconEl = document.createElement('i');
        iconEl.className = icon;
        banner.appendChild(iconEl);

        var span = document.createElement('span');
        span.textContent = text;
        banner.appendChild(span);

        return banner;
    }

    function appendField(list, label, value) {
        var row = document.createElement('div');
        row.className = 'credential-field';

        var term = document.createElement('dt');
        term.textContent = label;
        row.appendChild(term);

        var detail = document.createElement('dd');
        detail.textContent = value;
        row.appendChild(detail);

        list.appendChild(row);
    }

    function renderFailure(modifier, icon, heading, message) {
        clearResult();
        var card = document.createElement('div');
        card.className = 'credential-result';
        card.appendChild(buildBanner(modifier, icon, heading));

        var paragraph = document.createElement('p');
        paragraph.className = 'credential-message';
        paragraph.textContent = message;
        card.appendChild(paragraph);

        result.appendChild(card);
    }

    function renderVerified(credential, badge) {
        clearResult();

        var card = document.createElement('div');
        card.className = 'credential-result';
        card.appendChild(buildBanner('credential-banner--verified', 'bx bx-check-circle', 'Verified Credential'));

        var fields = document.createElement('dl');
        fields.className = 'credential-fields';
        appendField(fields, 'Issued to', credential.participantName);
        appendField(fields, 'Credential', badge.title);
        appendField(fields, 'Issue Date', core.formatIssueDate(credential.issueDate));
        appendField(fields, 'Credential ID', credential.id);
        card.appendChild(fields);

        var link = document.createElement('a');
        link.className = 'button';
        // Relative link keeps the verification page working on any host, not just the live domain.
        link.href = '../badges/' + credential.workshopId + '/?id=' + encodeURIComponent(credential.id);
        link.textContent = 'View Credential';
        card.appendChild(link);

        result.appendChild(card);
    }

    function verify(rawId) {
        var id = core.normalizeCredentialId(rawId);

        if (!id) {
            renderFailure('credential-banner--notfound', 'bx bx-error-circle', 'Enter a Credential ID', 'Type the credential ID from the badge page or your congratulations email, for example CI-ASYNC-20260801-001.');
            return;
        }

        submit.disabled = true;

        core.lookupCredential(id, basePrefix).then(function (lookup) {
            if (lookup.state === core.STATE.INVALID_FORMAT) {
                renderFailure('credential-banner--notfound', 'bx bx-error-circle', 'Credential Not Found', 'That does not look like a Coding Islander credential ID. IDs look like CI-ASYNC-20260801-001.');
                return;
            }
            if (lookup.state === core.STATE.NOT_FOUND) {
                renderFailure('credential-banner--notfound', 'bx bx-error-circle', 'Credential Not Found', 'No credential with the ID ' + id + ' exists in the Coding Islander registry.');
                return;
            }
            if (lookup.state === core.STATE.ERROR) {
                renderFailure('credential-banner--notfound', 'bx bx-error-circle', 'Credential Unavailable', 'We could not check this credential right now. Please try again shortly.');
                return;
            }
            if (lookup.state === core.STATE.REVOKED) {
                renderFailure('credential-banner--revoked', 'bx bx-x-circle', 'Credential Revoked', 'The credential ' + id + ' has been revoked by Coding Islander and is no longer valid.');
                return;
            }

            return core.loadWorkshop(lookup.credential.workshopId, basePrefix).then(function (workshop) {
                var badge = core.getBadge(workshop);
                if (!badge) {
                    renderFailure('credential-banner--notfound', 'bx bx-error-circle', 'Credential Unavailable', 'We could not load the badge details for this credential. Please try again shortly.');
                    return;
                }
                renderVerified(lookup.credential, badge);
            });
        }).then(function () {
            submit.disabled = false;
        });
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        verify(input.value);
    });

    // Allows linking straight to a pre-filled verification, e.g. verify.html?id=CI-OOP-20260815-001
    var presetId = new URLSearchParams(window.location.search).get('id');
    if (presetId) {
        input.value = core.normalizeCredentialId(presetId);
        verify(presetId);
    }
})();
