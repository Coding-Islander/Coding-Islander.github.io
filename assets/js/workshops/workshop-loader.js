document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const workshopSlug = params.get('w');

    if (!workshopSlug) {
        showError('No workshop specified.');
        return;
    }

    // Sanitise: only allow lowercase letters, numbers and hyphens
    if (!/^[a-z0-9-]+$/.test(workshopSlug)) {
        showError('Invalid workshop identifier.');
        return;
    }

    const jsonPath = '../data/workshops/' + workshopSlug + '.json';

    fetch(jsonPath)
        .then(function (response) {
            if (!response.ok) throw new Error('Workshop not found');
            return response.json();
        })
        .then(function (data) {
            renderWorkshop(data);
        })
        .catch(function () {
            showError('Workshop not found. Please check the link and try again.');
        });
});

function renderWorkshop(data) {
    // Page title
    var typeLabel = data.type === 'webinar' ? 'Webinar' : 'Workshop';
    document.title = (data.title || typeLabel) + ' | Coding Islander';

    // 1. Hero
    setText('workshop-title', data.title);
    setOptionalText('workshop-headline', data.headline);
    setOptionalText('workshop-subheadline', data.subheadline);
    if (data.cta) {
        setText('hero-cta', data.cta);
        //setText('mid-cta', data.cta);
    }

    // Optional hero image
    if (data.heroImage) {
        var heroContainer = document.getElementById('hero-container');
        var heroImgWrap = document.getElementById('hero-image');
        var heroImg = document.getElementById('hero-image-img');
        if (heroContainer && heroImgWrap && heroImg) {
            heroContainer.classList.add('workshop-hero--has-image');
            heroImg.src = data.heroImage;
            heroImg.alt = data.title || '';
            heroImgWrap.style.display = 'block';
        }
    }

    // Optional video
    if (data.youtubeVideoId) {
        var videoId = extractYouTubeId(data.youtubeVideoId);
        if (videoId) {
            var videoSection = document.getElementById('video-section');
            var videoWrapper = document.getElementById('video-wrapper');
            if (videoSection && videoWrapper) {
                videoSection.style.display = '';
                var iframe = document.createElement('iframe');
                iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(videoId);
                iframe.title = data.title || typeLabel + ' video';
                iframe.setAttribute('allowfullscreen', '');
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                iframe.setAttribute('loading', 'lazy');
                videoWrapper.appendChild(iframe);
            }
        }
    }

    // Update section headings based on type
    if (data.type === 'webinar') {
        setText('transformation-heading', 'After This Webinar, You Will');
        setText('why-different-heading', 'Why This Webinar Is Different');
    }

    // 2. Pain Points
    renderList('pain-points-list', data.painPoints, 'bx bx-x-circle');

    // 3. Transformation
    renderList('transformation-list', data.transformation, 'bx bx-check-circle');

    // 5. What We'll Work On
    renderList('what-well-work-on-list', data.whatYouWillDo, 'bx bx-wrench');

    // 6. Prerequisites
    setText('prerequisites-text', data.prerequisites);

    // 7. Why Different
    renderList('why-different-list', data.whyDifferent, 'bx bx-star');

    // 8. Instructor
    if (data.instructor) {
        setText('instructor-name', data.instructor.name);
        if (data.instructor.credentials && data.instructor.credentials.length) {
            var credContainer = document.getElementById('instructor-credentials');
            if (credContainer) {
                credContainer.innerHTML = '';
                data.instructor.credentials.forEach(function (cred) {
                    var badge = document.createElement('span');
                    badge.className = 'workshop-instructor__badge';
                    badge.innerHTML = '<i class="bx bx-check-shield"></i> ' + escapeHtml(cred);
                    credContainer.appendChild(badge);
                });
            }
        }
        setText('instructor-description', data.instructor.description);
    }

    // 9. Format & Logistics + Pricing (merged)
    if (data.format) {
        setText('format-mode', data.format.mode);
        setText('format-language', data.format.language);
        var batchSize = data.format.batchSize;
        setText('format-batch-size', batchSize ? batchSize : '');
    }
    renderPricing(data, typeLabel);

    // 10. Batches
    renderBatches(data.batches, data.paid === false);
}

/* ---- Helpers ---- */

function extractYouTubeId(input) {
    if (!input) return null;
    // Already a bare video ID (11 chars, no slashes/dots)
    if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;
    // Full or short YouTube URL
    var match = input.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return match ? match[1] : null;
}

function setText(id, text) {
    var el = document.getElementById(id);
    if (el && text) el.textContent = text;
}

function setOptionalText(id, text) {
    var el = document.getElementById(id);
    if (!el) return;
    if (text) {
        el.textContent = text;
        el.style.display = '';
    } else {
        el.style.display = 'none';
    }
}

function renderList(containerId, items, iconClass) {
    var container = document.getElementById(containerId);
    if (!container || !items || !items.length) return;
    container.innerHTML = '';
    items.forEach(function (item) {
        var li = document.createElement('li');
        li.className = 'workshop-list__item';
        var icon = document.createElement('i');
        icon.className = iconClass;
        li.appendChild(icon);
        var span = document.createElement('span');
        span.textContent = item;
        li.appendChild(span);
        container.appendChild(li);
    });
}

function renderPricing(data, typeLabel) {
    var formatGrid = document.getElementById('format-grid');
    if (!formatGrid) return;

    var pricingRow = document.createElement('div');
    pricingRow.className = 'workshop-format__pricing';

    if (data.paid === false) {
        pricingRow.innerHTML = '<i class="bx bx-gift"></i><div><strong>Price</strong><div class="workshop-format__price-free">This ' + escapeHtml(typeLabel.toLowerCase()) + ' is free</div></div>';
        formatGrid.appendChild(pricingRow);
        return;
    }

    var priceHtml = '<i class="bx bx-purchase-tag"></i><div><strong>Investment</strong><div class="workshop-format__pricing-values">';
    if (data.promotionPrice) {
        priceHtml += '<span class="workshop-format__price-old">' + escapeHtml(data.price) + '</span>';
        priceHtml += '<span class="workshop-format__price-current">' + escapeHtml(data.promotionPrice) + '</span>';
    } else if (data.price) {
        priceHtml += '<span class="workshop-format__price-current">' + escapeHtml(data.price) + '</span>';
    }
    priceHtml += '</div><span class="workshop-format__price-currency">Mauritian Rupees</span></div>';
    pricingRow.innerHTML = priceHtml;
    formatGrid.appendChild(pricingRow);
}

function renderBatches(batches, isFree) {
    var container = document.getElementById('batches-content');
    if (!container) return;
    container.innerHTML = '';

    // Filter out batches explicitly marked as not visible
    var visibleBatches = (batches || []).filter(function (b) {
        return b.visible !== false;
    });

    if (visibleBatches.length === 0) {
        var msg = document.createElement('div');
        msg.className = 'workshop-batches__none';
        msg.innerHTML = '<p>No upcoming batches are currently scheduled.</p>' +
            '<p>Interested? <a href="../index.html#contact" class="workshop-batches__contact-link">Get in touch</a> to request one.</p>';
        container.appendChild(msg);
        return;
    }

    // Show CTA message only when visible batches exist
    var batchesCta = document.getElementById('batches-cta');
    if (batchesCta) batchesCta.style.display = '';

    visibleBatches.forEach(function (batch) {
        var card = document.createElement('div');
        card.className = 'workshop-batch-card' + (batch.fullyBooked ? ' workshop-batch-card--full' : '');

        var heading = document.createElement('h3');
        heading.className = 'workshop-batch-card__title';
        heading.textContent = 'Batch ' + formatDate(batch.startDate);
        card.appendChild(heading);

        var totalSessions = '';
        if (batch.numberOfWeeks && batch.days && batch.days.length) {
            var count = batch.numberOfWeeks * batch.days.length;
            totalSessions = count + ' session' + (count > 1 ? 's' : '');
        }

        var isSingleDay = batch.numberOfWeeks === 1;

        var details = [
            { icon: 'bx bx-calendar', label: 'Starts', value: formatDateWithDay(batch.startDate) },
            { icon: 'bx bx-calendar-check', label: 'Ends', value: formatDateWithDay(batch.endDate) },
            { icon: 'bx bx-calendar-week', label: 'Days', value: batch.days ? (isSingleDay ? batch.days.join(' & ') : 'Every ' + batch.days.join(' & ')) : '' },
            { icon: 'bx bx-time-five', label: 'Time', value: batch.time, note: 'Mauritius time' },
            { icon: 'bx bx-hourglass', label: 'Per session', value: batch.hoursPerDay },
            { icon: 'bx bx-revision', label: 'Duration', value: isSingleDay ? '' : (batch.numberOfWeeks ? batch.numberOfWeeks + ' week' + (batch.numberOfWeeks > 1 ? 's' : '') : '') },
            { icon: 'bx bx-layer', label: 'Sessions', value: totalSessions }
        ];

        // Body: details on left, calendar on right
        var body = document.createElement('div');
        body.className = 'workshop-batch-card__body';

        var detailsWrap = document.createElement('div');
        detailsWrap.className = 'workshop-batch-card__details';

        details.forEach(function (d) {
            if (!d.value) return;
            var row = document.createElement('div');
            row.className = 'workshop-batch-card__row';
            var noteHtml = d.note ? ' <small class="workshop-batch-card__row-note">' + escapeHtml(d.note) + '</small>' : '';
            row.innerHTML = '<i class="' + escapeAttr(d.icon) + '"></i><strong>' + escapeHtml(d.label) + ':</strong> <span>' + escapeHtml(d.value) + noteHtml + '</span>';
            detailsWrap.appendChild(row);
        });

        body.appendChild(detailsWrap);

        // Mini calendar
        var sessionDates = getSessionDates(batch);
        if (sessionDates.length > 0) {
            var calEl = renderMiniCalendar(sessionDates);
            body.appendChild(calEl);
        }

        card.appendChild(body);

        if (batch.fullyBooked) {
            var fullBadge = document.createElement('div');
            fullBadge.className = 'workshop-batch-card__fully-booked';
            fullBadge.innerHTML = '<i class="bx bx-lock-alt"></i> Fully Booked';
            card.appendChild(fullBadge);
        } else if (batch.registrationLink) {
            var link = document.createElement('a');
            link.href = batch.registrationLink;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'button workshop-batch-card__register';
            link.textContent = isFree ? 'Register Free' : 'Register Now';
            card.appendChild(link);
        }

        container.appendChild(card);
    });
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateWithDay(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

var DAY_MAP = { 'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6 };

function getSessionDates(batch) {
    if (!batch.startDate || !batch.days || !batch.days.length || !batch.numberOfWeeks) return [];
    var start = new Date(batch.startDate + 'T00:00:00');
    var targetDays = batch.days.map(function (d) { return DAY_MAP[d.toLowerCase()]; }).filter(function (d) { return d !== undefined; });
    var dates = [];
    for (var week = 0; week < batch.numberOfWeeks; week++) {
        targetDays.forEach(function (dayNum) {
            var dt = new Date(start);
            dt.setDate(start.getDate() + (week * 7) + ((dayNum - start.getDay() + 7) % 7));
            dates.push(new Date(dt));
        });
    }
    dates.sort(function (a, b) { return a - b; });
    return dates;
}

function renderMiniCalendar(sessionDates) {
    // Group dates by month
    var months = {};
    sessionDates.forEach(function (d) {
        var key = d.getFullYear() + '-' + d.getMonth();
        if (!months[key]) months[key] = { year: d.getFullYear(), month: d.getMonth(), dates: [] };
        months[key].dates.push(d.getDate());
    });

    var wrapper = document.createElement('div');
    wrapper.className = 'mini-cal';

    Object.keys(months).forEach(function (key) {
        var m = months[key];
        var grid = document.createElement('div');
        grid.className = 'mini-cal__month';

        // Month/year header
        var header = document.createElement('div');
        header.className = 'mini-cal__header';
        header.textContent = new Date(m.year, m.month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
        grid.appendChild(header);

        // Day-of-week header row
        var dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
        var headRow = document.createElement('div');
        headRow.className = 'mini-cal__row mini-cal__row--head';
        dayNames.forEach(function (dn) {
            var c = document.createElement('span');
            c.className = 'mini-cal__day-name';
            c.textContent = dn;
            headRow.appendChild(c);
        });
        grid.appendChild(headRow);

        // Calendar cells
        var firstDay = new Date(m.year, m.month, 1);
        var startCol = (firstDay.getDay() + 6) % 7; // Monday-based
        var daysInMonth = new Date(m.year, m.month + 1, 0).getDate();
        var row = document.createElement('div');
        row.className = 'mini-cal__row';

        for (var i = 0; i < startCol; i++) {
            var empty = document.createElement('span');
            empty.className = 'mini-cal__cell mini-cal__cell--empty';
            row.appendChild(empty);
        }

        for (var day = 1; day <= daysInMonth; day++) {
            var cell = document.createElement('span');
            cell.className = 'mini-cal__cell';
            cell.textContent = day;
            if (m.dates.indexOf(day) !== -1) {
                cell.classList.add('mini-cal__cell--active');
            }
            row.appendChild(cell);
            if ((startCol + day) % 7 === 0 && day < daysInMonth) {
                grid.appendChild(row);
                row = document.createElement('div');
                row.className = 'mini-cal__row';
            }
        }
        grid.appendChild(row);
        wrapper.appendChild(grid);
    });

    return wrapper;
}

function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function escapeAttr(str) {
    return str.replace(/[&"'<>]/g, function (c) {
        return { '&': '&amp;', '"': '&quot;', "'": '&#39;', '<': '&lt;', '>': '&gt;' }[c];
    });
}

function showError(message) {
    var main = document.querySelector('.l-main');
    if (main) {
        main.innerHTML = '<section class="workshop-error section"><div class="bd-grid"><h2 class="section-title">Oops</h2><p class="workshop-text">' + escapeHtml(message) + '</p><a href="../index.html" class="button">Back to Home</a></div></section>';
    }
}