WW = window.innerWidth || document.clientWidth || document.getElementsByTagName('body')[0].clientWidth
WH = window.innerHeight || document.clientHeight || document.getElementsByTagName('body')[0].clientHeight
BODY = document.getElementsByTagName('body')[0]


document.addEventListener('DOMContentLoaded', function() {
	// Cases slider
	const casesSliders = [],
		cases = document.querySelectorAll('.cases .swiper')

	cases.forEach((el, i) => {
		el.classList.add('cases_s' + i)

		let options = {
			loop: false,
			speed: 500,
			watchSlidesProgress: true,
			slideActiveClass: 'active',
			slideVisibleClass: 'visible',
			lazy: true,
			navigation: {
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev'
			},
			spaceBetween: 0,
			slidesPerView: 1,
			autoHeight: true,
		}

		casesSliders.push(new Swiper('.cases_s' + i, options))
	})


	// Collection slider
	const collectionSliders = [],
		collection = document.querySelectorAll('.collection .swiper')

	collection.forEach((el, i) => {
		el.classList.add('collection_s' + i)

		let options = {
			loop: true,
			loopAdditionalSlides: 1,
			speed: 500,
			watchSlidesProgress: true,
			slideActiveClass: 'active',
			slideVisibleClass: 'visible',
			lazy: true,
			navigation: {
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev'
			},
			pagination: {
				el: '.swiper-pagination',
				type: 'bullets',
				clickable: true,
				bulletActiveClass: 'active'
			},
			spaceBetween: 20,
			slidesPerView: 1,
			on: {
				init: swiper => {
					setTimeout(() => $(swiper.el).find('.count .total').text(swiper.slides.length))
				},
				activeIndexChange: swiper => {
					setTimeout(() => $(swiper.el).find('.count .current').text((swiper.realIndex + 1)))
				},
			}
		}

		collectionSliders.push(new Swiper('.collection_s' + i, options))
	})


	// Product info
	if ($('.product_info .images').length) {
		const productImages = document.querySelector('.product_info .big .swiper'),
			productThumbs = document.querySelector('.product_info .thumbs .swiper')

		const productThumbsSlider = new Swiper('.product_info .thumbs .swiper', {
			loop: false,
			speed: 500,
			watchSlidesProgress: true,
			slideActiveClass: 'active',
			slideVisibleClass: 'visible',
			direction: 'vertical',
			navigation: {
				nextEl: productThumbs.querySelector('.swiper-button-next'),
				prevEl: productThumbs.querySelector('.swiper-button-prev')
			},
			spaceBetween: getCssVar(productThumbs, '--spaceBetween'),
			slidesPerView: getCssVar(productThumbs, '--slidesPerView'),
		})

		new Swiper('.product_info .big .swiper', {
			loop: false,
			speed: 500,
			watchSlidesProgress: true,
			slideActiveClass: 'active',
			slideVisibleClass: 'visible',
			spaceBetween: getCssVar(productImages, '--spaceBetween'),
			slidesPerView: getCssVar(productImages, '--slidesPerView'),
			thumbs: {
				swiper: productThumbsSlider
			},
		})
	}


	// Product metal
	$('.product_info .metal .main input').change(function(e) {
		const index = $(this).closest('label').index() + 1

		$('.product_info .metal .metal_info').hide()
		$('.product_info .metal .metal_info' + index).fadeIn(200)

		updateOrderInfo()
	})


	// Product metal params
	$('.product_info .metal .metal_info input').change(updateOrderInfo)


	// Product size
	const sizes = $('.product_info .size input[name="size"]'),
		readySizes = $('.product_info .size label.ready')

	let otherSize = '',
		unknownSize = false

	sizes.change(() => selectSize())

	function selectSize(other = '', unknown = false) {
		otherSize = other
		unknownSize = unknown

		if (other || unknown) {
			sizes.prop('checked', false)
		}

		updateOrderInfo()
	}


	// Product other size
	$('#other_size_modal form').submit(function(e) {
		e.preventDefault()

		const size = String(parseFloat($(this).find('.input').val().replace(',', '.'))).replace('.', ','),
			input = sizes.filter((i, el) => $(el).next('.val').text() === size)

		input.prop('checked', true)

		selectSize(input.length ? '' : size)

		this.closest('.side_modal').close()
	})


	// Product unknown size
	$('[data-size-unknown]').click(function() {
		selectSize('', true)

		this.closest('.side_modal').close()
	})


	// Product select metal
	$('[data-select-metal]').click(function() {
		this.closest('.side_modal').close()

		$('.product_info .metal .main input[value="' + this.dataset.selectMetal + '"]').prop('checked', true).trigger('change')

		document.querySelector('.product_info .metal').scrollIntoView({ block: 'center', behavior: 'smooth' })
	})


	// Product mode: select - no size, ready - in stock, repeat - made to order, quote / unknown - cost is calculated
	function getProductMode(metal) {
		if (!sizes.length) {
			return metal === 'silver' ? $('.product_info').attr('data-stock') : 'quote'
		}

		if (unknownSize) return 'unknown'
		if (!otherSize && !sizes.is(':checked')) return 'select'
		if (metal !== 'silver' || otherSize) return 'quote'

		return readySizes.find('input').is(':checked') ? 'ready' : 'repeat'
	}


	// Product order info
	function updateOrderInfo() {
		const metal = $('.product_info .metal .main input:checked').val(),
			mode = getProductMode(metal),
			size = otherSize || sizes.filter(':checked').next('.val').text()

		// Elements for certain metals / modes only
		document.querySelectorAll('[data-state]').forEach(el => {
			const states = el.dataset.state.split(' ')

			el.classList.toggle('hide', !states.includes(metal) && !states.includes(mode))
		})

		// Ready sizes are in silver only
		readySizes.toggleClass('ready', metal === 'silver').toggleClass('will_manufacture', metal !== 'silver')

		readySizes.find('[data-ready]').each((i, el) => {
			el.textContent = metal === 'silver' ? el.dataset.ready : el.dataset.manufacture
		})

		// Selected params
		$('.performance_color').text($('.product_info .metal input[name="metal2_color"]:checked').next().text())
		$('.performance_fineness').text($('.product_info .metal input[name="metal2_fineness"]:checked').next().text())
		$('.performance_size').text(size || $('.product_info .size').attr(unknownSize ? 'data-unknown' : 'data-empty'))
		$('.selected_metal').text($('.product_info .order_info:not(.hide) .performance_metal').text())
	}


	window.addEventListener('pageshow', () => {
		if (!$('.product_info .metal').length) return

		const metalIndex = $('.product_info .metal .main input:checked').closest('label').index() + 1

		$('.product_info .metal .metal_info').hide()
		$('.product_info .metal .metal_info' + metalIndex).show()

		updateOrderInfo()
	})


	// Reviews slider
	document.querySelectorAll('.review .images .swiper').forEach(el => {
		new Swiper(el, {
			loop: false,
			// loopAdditionalSlides: 1,
			speed: 500,
			watchSlidesProgress: true,
			slideActiveClass: 'active',
			slideVisibleClass: 'visible',
			spaceBetween: getCssVar(el, '--spaceBetween'),
			slidesPerView: getCssVar(el, '--slidesPerView'),
			nested: true,
		})
	})


	document.querySelectorAll('.reviews .swiper.main').forEach(el => {
		new Swiper(el, {
			loop: false,
			// loopAdditionalSlides: 1,
			speed: 500,
			watchSlidesProgress: true,
			slideActiveClass: 'active',
			slideVisibleClass: 'visible',
			breakpoints: {
				0: {
					spaceBetween: getCssVar(el, '--spaceBetween-0'),
					slidesPerView: getCssVar(el, '--slidesPerView-0'),
				},
				768: {
					spaceBetween: getCssVar(el, '--spaceBetween-768'),
					slidesPerView: getCssVar(el, '--slidesPerView-768'),
				},
				1280: {
					spaceBetween: getCssVar(el, '--spaceBetween-1280'),
					slidesPerView: getCssVar(el, '--slidesPerView-1280'),
				}
			}
		})
	})


	// Products slider
	document.querySelectorAll('.products .swiper').forEach(el => {
		new Swiper(el, {
			loop: false,
			// loopAdditionalSlides: 1,
			speed: 500,
			watchSlidesProgress: true,
			slideActiveClass: 'active',
			slideVisibleClass: 'visible',
			breakpoints: {
				0: {
					spaceBetween: getCssVar(el, '--spaceBetween-0'),
					slidesPerView: getCssVar(el, '--slidesPerView-0'),
				},
				768: {
					spaceBetween: getCssVar(el, '--spaceBetween-768'),
					slidesPerView: getCssVar(el, '--slidesPerView-768'),
				},
				1280: {
					spaceBetween: getCssVar(el, '--spaceBetween-1280'),
					slidesPerView: getCssVar(el, '--slidesPerView-1280'),
				}
			}
		})
	})


	// Fancybox - zoom images
	Fancybox.bind('.fancy_img', {
		l10n: Fancybox.l10n.ru_RU,
		zoomEffect: false,
		Carousel: {
			Zoomable: {
				Panzoom: {
					maxScale: 1
				}
			}
		}
	})


	// Dialog
	document.addEventListener('click', e => {
		const openBtn = e.target.closest('[data-open-modal]')

		if (openBtn) {
			e.preventDefault()

			document.getElementById(openBtn.dataset.openModal)?.showModal()
		}


		const closeBtn = e.target.closest('[data-close-modal]')

		if (closeBtn) {
			closeBtn.closest('dialog')?.close()
		}


		// Click outside the modal content
		const modal = e.target.closest('.side_modal')

		if (modal && !e.target.closest('.inner')) {
			modal.close()
		}
	})


	// Order
	$('#order_modal form, #order_modal2 form').submit((e) => {
		e.preventDefault()

		const modal = e.target.closest('.side_modal')

		modal.close()

		document.getElementById('check_order_modal')?.showModal()
	})

	$('#check_order_modal .submit_btn').click((e) => {
		e.preventDefault()

		const modal = e.target.closest('.side_modal')

		modal.close()

		document.getElementById('success_order_modal')?.showModal()
	})

	$('#cost_production_order_modal form, #change_model_order_modal form').submit((e) => {
		e.preventDefault()

		const modal = e.target.closest('.side_modal')

		modal.close()

		document.getElementById('ready_order_modal')?.showModal()
	})


	// Mob. menu
	$('.mob_header .mob_menu_btn').click((e) => {
		e.preventDefault()

		$('.mob_header .mob_menu_btn').toggleClass('active')
		$('body').toggleClass('lock')
		$('header').toggleClass('show')

		$('.mob_header .mob_menu_btn').hasClass('active')
			? $('.overlay').fadeIn(300)
			: $('.overlay').fadeOut(200)
	})


	// Phone input mask
	const phoneInputs = document.querySelectorAll('input[type=tel]')

	if (phoneInputs) {
		phoneInputs.forEach(el => {
			IMask(el, {
				mask: '+{7} (000) 000-00-00',
				lazy: true
			})
		})
	}


	// Custom select - Nice select
	const selects = document.querySelectorAll('select:not(.skip)'),
		selectsInstances = []

	if (selects) {
		selects.forEach(el => {
			selectsInstances.push(NiceSelect.bind(el, {
				placeholder: el.getAttribute('data-placeholder')
			}))

			el.addEventListener('change', () => el.classList.add('selected'))

			if (el.querySelector('option[selected]')) {
				el.classList.add('selected')
			}
		})
	}


	// Select file
	const fileInputs = document.querySelectorAll('form input[type=file]')

	if (fileInputs) {
		fileInputs.forEach(el => {
			el.addEventListener('change', () => el.closest('.file').querySelector('label span').innerText = el.value)
		})
	}


	// Accordion
	$('body').on('click', '.accordion .accordion_item .head', function(e) {
		e.preventDefault()

		let item = $(this).closest('.accordion_item'),
			accordion = $(this).closest('.accordion')

		if (item.hasClass('active')) {
			item.removeClass('active').find('.data').slideUp(300)
		} else {
			accordion.find('.accordion_item').removeClass('active')
			accordion.find('.data').slideUp(300)

			item.addClass('active').find('.data').slideDown(300)
		}
	})
})



window.addEventListener('load', function () {
	// Hidden details
	document.querySelectorAll('.hidden_details .grid_row').forEach(el => {
		let styles = getComputedStyle(el)

		hiddenDetailsHeight(el, parseInt(styles.getPropertyValue('--items_per_line')))
	})
})



window.addEventListener('resize', function () {
	WH = window.innerHeight || document.clientHeight || BODY.clientHeight

	let windowW = window.outerWidth

	if (typeof WW !== 'undefined' && WW != windowW) {
		// Overwrite window width
		WW = window.innerWidth || document.clientWidth || BODY.clientWidth


		// Hidden details
		document.querySelectorAll('.hidden_details .grid_row').forEach(el => {
			let styles = getComputedStyle(el)

			hiddenDetailsHeight(el, parseInt(styles.getPropertyValue('--items_per_line')))
		})


		// Mob. version
		if (!fakeResize) {
			fakeResize = true
			fakeResize2 = false

			document.getElementsByTagName('meta')['viewport'].content = 'width=device-width, initial-scale=1, maximum-scale=1'
		}

		if (!fakeResize2) {
			fakeResize2 = true

			if (windowW < 375) document.getElementsByTagName('meta')['viewport'].content = 'width=375, user-scalable=no'
		} else {
			fakeResize = false
			fakeResize2 = true
		}
	}
})



// Hidden details
function hiddenDetailsHeight(context, step) {
	let start = 0,
		finish = step,
		stocks = [...context.querySelectorAll('.item')],
		stocksDesc = context.querySelectorAll('.desc'),
		stocksName = context.querySelectorAll('.name'),
		i = 0

	stocksDesc.forEach(el => el.style.height = 'auto')
	stocksName.forEach(el => el.style.height = 'auto')

	stocks.forEach(el => {
		stocks.slice(start, finish).forEach(el => el.setAttribute('nodeList', i))

		setHeight(context.querySelectorAll('[nodeList="' + i + '"] .desc'))
		setHeight(context.querySelectorAll('[nodeList="' + i + '"] .name'))

		start = start + step
		finish = finish + step
		i++
	})
}