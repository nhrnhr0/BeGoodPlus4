





set_form_change_listener('#business-contact-form', 'main')



var logo_swiper = new Swiper(".logo-swiper", {
  //freeMode: true,
  //freeModeFluid: true,
  loop: true,
  speed:4000,
  spaceBetween: 50,
  slidesPerView: "auto",
  autoplay: {
    delay:0,
  }
});


$('.logo-swiper').hover(function() {
  logo_swiper.autoplay.stop();
  console.log('logo_swiper.autoplay.stop();')
},function() {
  logo_swiper.autoplay.start();
  console.log('logo_swiper.autoplay.start();')
});
