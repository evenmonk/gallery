let current = -1;
let lastImageID;

$(function() {
    const showImage = href => $('.full-img-pic-layout').append(`<img class="full-img" src=${href}>`);

    $('.img-container').on('click', function(e) {
        if ($(e.target).attr('class') === 'img-info__text') return;
        e.preventDefault();

        current = +$(this).attr('id');
        const href = $(this).data('href');
        lastImageID = +$('.page-content').data('last-id');
        console.log(lastImageID)

        openFullImageGallery();
        showImage(href);
    })

    $('.full-img-pic-layout').on('click', function(e) {
        console.log(e.target)
        const targetClass = $(e.target).attr('class');
        if (targetClass !== 'arrow-left' && targetClass !== 'arrow-right' && targetClass !== 'full-img') {
            console.log($(e.target).attr('class'));
            closeFullImageGallery();
        }
    })

    $('.arrow-right').on('click', (e) => nextImage());
    $('.arrow-left').on('click', (e) => previousImage());

    $(document).on('keydown', (e) => {
        console.log(e.code);
        if ($('.full-img')) {
            if (e.code === "ArrowRight") nextImage();
            else if (e.code === "ArrowLeft") previousImage();
            else if (e.code === "Escape") closeFullImageGallery();
        }
    })

    const openFullImageGallery = () => {
        $('.full-img-pic-layout').removeClass('hidden');
        $('body').css('overflow', 'hidden');

    }

    const closeFullImageGallery = () => {
        $('.full-img').remove();
        $('.full-img-pic-layout').addClass('hidden');
        $('body').css('overflow', 'auto');
    }

    const nextImage = () => {
        $('.full-img').remove();
        current = current === lastImageID ? 0 : ++current;
        console.log(current);
        const href = $(`#${current}`).data('href');
        showImage(href);
    }

    const previousImage = () => {
        $('.full-img').remove();
        current = current === 0 ? lastImageID : --current;
        console.log(current);
        const href = $(`#${current}`).data('href');
        showImage(href);
    }

    // changing span after choosing images to upload
    const file = document.getElementById('file');

    const fileChosen = document.getElementById('file-chosen');

    file.addEventListener('change', function() {
        fileChosen.textContent = this.files[0].name
    })
})