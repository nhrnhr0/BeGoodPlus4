
// -------------- form submit validation ----------------------
const form = document.getElementById('form');
const client_name_input = document.getElementById("client_name_inp");
const private_company_input = document.getElementById("private_company_inp");
const addres_input = document.getElementById("addres_inp");
const tel_input = document.getElementById("tel_inp");
const email_input = document.getElementById("email_inp");
const contact_man_input = document.getElementById("contact_man_inp");
const cell_input = document.getElementById("cell_inp");

/*form.addEventListener('submit', e => {
	e.preventDefault();
	
	checkInputs();
});*/

function checkInputsForPage1() {
	// trim to remove the whitespaces
	const client_name_inputValue = client_name_input.value.trim();
    const private_company_inputValue = private_company_input.value.trim();
    const addres_inputValue = addres_input.value.trim();
    const tel_inputValue = tel_input.value.trim();
    const email_inputValue = email_input.value.trim();
    const contact_man_inputValue = contact_man_input.value.trim();
    const cell_inputValue = cell_input.value.trim();
    
    var error_found = false;
	
	if(client_name_inputValue === '') {
		setErrorFor(client_name_input, 'שם לקוח לא יכול להיות ריק');
		error_found = true;
	} else {
		setSuccessFor(client_name_input);
	}
	
	if(addres_inputValue == '') {
        setErrorFor(addres_input, 'כתוכת לא יכולה להיות שדה ריק')
        error_found = true;
	}else {
        setSuccessFor(addres_input);
	}
	
	if(tel_inputValue == '' && cell_inputValue == '') {
        setErrorFor(cell_input, 'חובה להכניס לפחות מספר טלפון או נייד');
        setErrorFor(tel_input, 'חובה להכניס לפחות מספר טלפון או נייד');
        error_found = true;
    } else {
        setSuccessFor(cell_input);
        setSuccessFor(tel_input);
    }
    
    if(isEmail(email_inputValue) == false) {
        setErrorFor(email_input, 'שדה אימייל ריק או לא תקין');
        error_found = true;
    } else {
        setSuccessFor(email_input);
    }
    
    if(contact_man_inputValue == '') {
        setErrorFor(contact_man_input, 'חובה להזין איש קשר');
        error_found = true;
    } else {
        setSuccessFor(contact_man_input);
    }
    
    return error_found == false;
}

function setErrorFor(input, message) {
	const formControl = input.parentElement;
	const small = formControl.querySelector('small');
	formControl.className = 'form-control error';
	small.innerText = message;
}

function setSuccessFor(input) {
	const formControl = input.parentElement;
	formControl.className = 'form-control success';
}
	
function isEmail(email) {
	return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
}



// -------------- progress-bar for order form ----------------------
const slidePage =   document.querySelector(".slidepage");
const firstNextBtn = document.querySelector(".nextBtn");
const prevBtnSec = document.querySelector(".prev-1");
const nextBtnSec = document.querySelector(".next-1");
const prevBtnThird = document.querySelector(".prev-2");
const nextBtnThird = document.querySelector(".next-2");
const prevBtnFourth = document.querySelector(".prev-3");
const submitBtn = document.querySelector(".submit");

const progressText = document.querySelectorAll(".step p");
const progressCheck = document.querySelectorAll(".step .check");
const bullet = document.querySelectorAll(".step .bullet");
var max = 4;
var current = 1;


firstNextBtn.addEventListener("click", function() {
    if(checkInputsForPage1() == true) {
        slidePage.style.marginRight = "-25%";
        bullet[current -1].classList.add("active");
        progressText[current -1].classList.add("active");
        progressCheck[current -1].classList.add("active");
        current += 1;
    } else {
        //alert("fix error to move to next page");
    }
});
nextBtnSec.addEventListener("click", function() {
    slidePage.style.marginRight = "-50%";
    bullet[current -1].classList.add("active");
    progressText[current -1].classList.add("active");
    progressCheck[current -1].classList.add("active");
    current += 1;
});
nextBtnThird.addEventListener("click", function() {
    slidePage.style.marginRight = "-75%";
    bullet[current -1].classList.add("active");
    progressText[current -1].classList.add("active");
    progressCheck[current -1].classList.add("active");
    current += 1;
});

submitBtn.addEventListener("click", function() {
    bullet[current -1].classList.add("active");
    progressText[current -1].classList.add("active");
    progressCheck[current -1].classList.add("active");
    current += 1;
    setTimeout(()=> {
        alert('thanks');
        location.reload();
    }, 800);
    
});

prevBtnSec.addEventListener("click", function() {
    slidePage.style.marginRight = "0%";
    bullet[current -2].classList.remove("active");
    progressText[current -2].classList.remove("active");
    progressCheck[current -2].classList.remove("active");
    current -= 1;
});


prevBtnThird.addEventListener("click", function() {
    slidePage.style.marginRight = "-25%";
    bullet[current -2].classList.remove("active");
    progressText[current -2].classList.remove("active");
    progressCheck[current -2].classList.remove("active");
    current -= 1;
});

prevBtnFourth.addEventListener("click", function() {
    slidePage.style.marginRight = "-50%";
    bullet[current -2].classList.remove("active");
    progressText[current -2].classList.remove("active");
    progressCheck[current -2].classList.remove("active");
    current -= 1;
});









// -------------- google maps input field autocomplete init ----------------------
$( document ).ready(function() {
    // init google map api
    var mapAutocomplete = new google.maps.places.Autocomplete(document.getElementById("addres_inp"));
    mapAutocomplete.setComponentRestrictions({'country': ['il']});
    google.maps.event.addListener(mapAutocomplete, 'place_changed', function () {
        // trigger chage event for autosave.
        // addEventListener("change") on called automaticliy on google places api input field
        addres_input.dispatchEvent(new Event('change'));
    });
});



// -------------- save the user input in sessionStorage and restore it on ----------------------
set_autosave(client_name_input,"client_name_input_atuosave");
set_autosave(private_company_input,"private_company_input_atuosave");
set_autosave(addres_input, "addres_input_atuosave");
set_autosave(tel_input, "tel_input_atuosave");
set_autosave(email_input, "email_input_atuosave");
set_autosave(contact_man_input, "contact_man_input_atuosave");
set_autosave(cell_input, "cell_input_atuosave");

function set_autosave(selector, autosave_identifier) {
    if (sessionStorage.getItem(autosave_identifier)) {
        selector.value = sessionStorage.getItem(autosave_identifier);
    }
    selector.addEventListener("change", function() {
        sessionStorage.setItem(autosave_identifier, selector.value);
        console.log(autosave_identifier + ' saved: ' + selector.value);
    });
}