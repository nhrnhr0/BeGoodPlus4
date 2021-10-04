var sections = document.querySelectorAll('main .section');




// TODO: remove in production

/*for(let i = 0; i < sections.length; i++) {
  sections[i].classList.remove('d-hidden');
} 
console.log('done remove d hidden');*/


function set_top_property_of_lines_to_stack() {
  // set up spaces between the lines
  lines = document.getElementById('parralex_container').querySelectorAll('.line');
  var topOffset = 150;
  for (var i = 0; i < lines.length; i++) {
    var str = topOffset + 'px';
    lines[i].style.top = str;
    topOffset += lines[i].getBoundingClientRect().height;
    console.log('set ', lines[i], ' to height: ', lines[i].style.top)
  }
}


var options = {
  strings: ['גם אתם רוצים נוככות ^100דיגיטאלית?',
    'גם אתם רוצים נוכחות דיגיטאלית!'
  ],
  typeSpeed: 40,
  backSpeed: 80,
  backDelay: 1000,
  onComplete: (typedEl) => {
    document.getElementById('arrow').classList.add('active');
    for (let i = 0; i < sections.length; i++) {
      sections[i].classList.remove('d-hidden');
    }
    document.getElementById('footer-2').classList.remove('d-hidden');
    set_top_property_of_lines_to_stack();

    document.querySelector('#main_filler').style.height = document.querySelector('main').getBoundingClientRect().height - 100 + 'px';
  },
};




var typed = new Typed('#title_1', options);

setTimeout(() => {
  // set an element with hight inside the body so the navbar won't disapear
  console.log(' document.querySelector(main).getBoundingClientRect().height: ', document.querySelector('main').getBoundingClientRect().height)



  // load iframes dinamicly to save initial load time
  var iframes = document.querySelectorAll('.websites .website-wraper .iframe iframe');
  for (var i = 0; i < iframes.length; i++) {
    var src = iframes[i].getAttribute('data-src');
    iframes[i].setAttribute('src', src);
    iframes[i].removeAttribute('data-src');
    console.log('setting up iframe src: ', src);
  }
}, 0);


var parScene = document.querySelector('main .section:nth-child(7) .programs-logos');
var parallaxInstance = new Parallax(parScene);


set_form_change_listener('#websites-contact-form', 'technology');
set_form_change_listener('#websites-contact-form-2', 'technology2');

document.getElementById('all-wraper').classList.remove('loading')
document.getElementById('all-wraper').classList.remove('done')






//document.body.classList.remove('loading');
//document.body.classList.add('done');