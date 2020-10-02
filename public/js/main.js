$(function () {
    $('#datetimepicker1').datepicker({
        autoclose: true
    });
});

$('.carousel-item').first().addClass('active')
$('.slide-number').first().addClass('active')

$('#modal1').on('hidden.bs.modal', function (e) {
    // do something...
    $('#modal1 iframe').attr("src", $("#modal1 iframe").attr("src"));
});

$("#generalRating").rating({ displayOnly: true });
$("#userRating").rating();
$(".commentsRating").rating({ displayOnly: true });

function moviePlayed(e) {
    $.ajax({
        url: '/filmova/home',
        type: 'POST',
        data: { movieId: e.previousElementSibling.value }
    }).done(response => {
        console.log(response)
    })
}

var myConfObj = {
    iframeMouseOver: false
}

var play = false;

window.addEventListener('blur', function () {
    if (myConfObj.iframeMouseOver) {
        console.log(!play)
        if (!play) {
            $.ajax({
                url: '/filmova/home',
                type: 'POST',
                data: { movieId: $("#idmovie").val() }
            }).done(response => {
                console.log(response)
                play = true;
            })
        }

    }
});

document.getElementById('movieframe').addEventListener('mouseover', function () {
    myConfObj.iframeMouseOver = true;
    console.log(myConfObj.iframeMouseOver)
});
document.getElementById('movieframe').addEventListener('mouseout', function () {
    myConfObj.iframeMouseOver = false;
    console.log(myConfObj.iframeMouseOver)
});