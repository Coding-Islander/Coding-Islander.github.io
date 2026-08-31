/**
 * Coding Islander - credential system configuration.
 * Shared by the per-workshop badge pages and the public verification page.
 */
(function (global) {
    'use strict';

    global.CI_CREDENTIAL_CONFIG = {
        // Used to build absolute credential URLs for LinkedIn. Must match the CNAME domain.
        SITE_ORIGIN: 'https://codingislander.com',
        ORGANIZATION_NAME: 'Coding Islander',

        // Numeric ID of the Coding Islander LinkedIn company page. While this is left as the
        // placeholder, the "Add to LinkedIn Profile" link falls back to a free-text issuer name.
        LINKEDIN_ORGANIZATION_ID: '106110100',

        // Paths are resolved against each page's data-base-prefix (".." or "../..").
        CREDENTIALS_PATH: 'data/credentials.json',
        WORKSHOPS_DIR: 'data/workshops',

        // CI-[WORKSHOP CODE]-[YYYYMMDD]-[SEQUENCE]
        CREDENTIAL_ID_PATTERN: /^CI-[A-Z0-9]{2,12}-\d{8}-\d{3,4}$/,
        WORKSHOP_SLUG_PATTERN: /^[a-z0-9-]+$/
    };
})(window);
