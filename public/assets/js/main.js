/*
	Fractal by HTML5 UP
	html5up.net | @n33co
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	skel.breakpoints({
		xlarge:		'(max-width: 1680px)',
		large:		'(max-width: 1280px)',
		medium:		'(max-width: 980px)',
		small:		'(max-width: 736px)',
		xsmall:		'(max-width: 480px)',
		xxsmall:	'(max-width: 360px)'
	});

	$(function() {

		var	$window = $(window),
			$body = $('body');

		// Disable animations/transitions until the page has loaded.
			$body.addClass('is-loading');

			$window.on('load', function() {
				window.setTimeout(function() {
					$body.removeClass('is-loading');
				}, 100);
			});

		// Mobile?
			if (skel.vars.mobile)
				$body.addClass('is-mobile');
			else
				skel
					.on('-medium !medium', function() {
						$body.removeClass('is-mobile');
					})
					.on('+medium', function() {
						$body.addClass('is-mobile');
					});

		// Fix: Placeholder polyfill.
			$('form').placeholder();

		// Prioritize "important" elements on medium.
			skel.on('+medium -medium', function() {
				$.prioritize(
					'.important\\28 medium\\29',
					skel.breakpoint('medium').active
				);
			});

		// Scrolly.
			$('.scrolly')
				.scrolly({
					speed: 1500
				});

	});


$(document).ready(function()
{
    $('#thumbCarousel').carousel({
		interval: 3000
	})
});

/* affix the Carousel Buttons to Carousel Item on scroll */
$('.nav-carousel').bind({
	offset:
	{
		top: $('#thumbCarousel').height()-$('.nav-carousel').height()
	}
});

$(document).ready( function()
{
	var carouselContainer = $('.carousel');
	var slideInterval = 2500;
	
	$('#carousel').carousel({
		interval:   slideInterval
	});
	
	var clickEvent = false;
	$('#thumbCarousel').on('click', '.nav-carousel a', function() {
			clickEvent = true;
			$('.nav-carousel li').removeClass('active');
			$(this).parent().addClass('active');	
	}).on('slid.bs.carousel', function(e)
	{
		if(!clickEvent)
		{
			var count = $('.nav-carousel').children().length -1;
			var current = $('.nav-carousel li.active');
			current.removeClass('active').next().addClass('active');
			var id = parseInt(current.data('slide-to'));
			if(count == id)
			{
				$('.nav-carousel li').first().addClass('active');	
			}
		}
		clickEvent = false;
	});
});

$(document).ready(function()
{

	$('.slide1, .slide2, .slide3').hover(function()
	{
		$(this).find('.caption').delay(200).slideDown(350);
	},
	function()
	{
		$(this).find('.caption').delay(200).slideUp(350);
	});
	
	$('.fade1, .fade2').hover(
		function(){
			$(this).find('.caption').delay(200).fadeIn(350);
		},
		function(){
			$(this).find('.caption').delay(200).fadeOut(350);
		}
	);
});

})(jQuery);