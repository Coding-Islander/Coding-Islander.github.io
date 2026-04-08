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
        setText('instructor-description', data.instructor.description);
    }

    // 9. Format & Logistics + Pricing (merged)
    if (data.format) {
        setText('format-mode', data.format.mode);
        setText('format-language', data.format.language);
        var batchSize = data.format.batchSize;
        setText('format-batch-size', batchSize ? batchSize + ' participants' : '');
    }
    renderPricing(data, typeLabel);

    // 10. Batches
    renderBatches(data.batches);
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

    var priceHtml = '<i class="bx bx-purchase-tag"></i><div><strong>Price</strong><div class="workshop-format__pricing-values">';
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

function renderBatches(batches) {
    var container = document.getElementById('batches-content');
    if (!container) return;
    container.innerHTML = '';

    if (!batches || batches.length === 0) {
        var msg = document.createElement('div');
        msg.className = 'workshop-batches__none';
        msg.innerHTML = '<p>No upcoming batches are currently scheduled.</p>' +
            '<p>Interested? <a href="../index.html#contact" class="workshop-batches__contact-link">Get in touch</a> to request one.</p>';
        container.appendChild(msg);
        return;
    }

    // Show CTA message only when batches exist
    var batchesCta = document.getElementById('batches-cta');
    if (batchesCta) batchesCta.style.display = '';

    batches.forEach(function (batch, index) {
        var card = document.createElement('div');
        card.className = 'workshop-batch-card';

        var heading = document.createElement('h3');
        heading.className = 'workshop-batch-card__title';
        heading.textContent = batches.length > 1 ? 'Batch ' + (index + 1) : 'Next Batch';
        card.appendChild(heading);

        var totalSessions = '';
        if (batch.numberOfWeeks && batch.days && batch.days.length) {
            var count = batch.numberOfWeeks * batch.days.length;
            totalSessions = count + ' session' + (count > 1 ? 's' : '');
        }

        var details = [
            { icon: 'bx bx-calendar', label: 'Starts', value: formatDate(batch.startDate) },
            { icon: 'bx bx-time-five', label: 'Time', value: batch.time },
            { icon: 'bx bx-calendar-week', label: 'Days', value: batch.days ? 'Every ' + batch.days.join(' & ') : '' },
            { icon: 'bx bx-revision', label: 'Duration', value: batch.numberOfWeeks ? batch.numberOfWeeks + ' week' + (batch.numberOfWeeks > 1 ? 's' : '') : '' },
            { icon: 'bx bx-layer', label: 'Sessions', value: totalSessions },
            { icon: 'bx bx-hourglass', label: 'Per session', value: batch.hoursPerDay }
        ];

        details.forEach(function (d) {
            if (!d.value) return;
            var row = document.createElement('div');
            row.className = 'workshop-batch-card__row';
            row.innerHTML = '<i class="' + escapeAttr(d.icon) + '"></i><strong>' + escapeHtml(d.label) + ':</strong> <span>' + escapeHtml(d.value) + '</span>';
            card.appendChild(row);
        });

        if (batch.registrationLink) {
            var link = document.createElement('a');
            link.href = batch.registrationLink;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'button workshop-batch-card__register';
            link.textContent = 'Register Now';
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