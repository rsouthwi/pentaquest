
const toggle = function(elemClass) {
    const elements = document.getElementsByClassName(elemClass);
    const changeVisibility = function(elem) {
        elem.style.visibility = getComputedStyle(elem, null).visibility === "hidden" ? "visible" : "hidden";
    };
    [...elements].forEach(elem => changeVisibility(elem));
};

const userTextPropmt = function(message, callBack) {
    let interfaceElements = [];
    const messageArea = document.getElementById('messageArea');
    const hideInterfaceElements = function() {
        interfaceElements.forEach(elem => elem.parentNode.removeChild(elem))
    };
    const submitFunction = function(value) {
        // we could handle input errors in here
        hideInterfaceElements();
        callBack(value);
    };

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.id = 'userTextPrompt';
    textInput.addEventListener('keydown', event => {
        let key = event.key || event.keyCode || event.which;
        if (key === 13 || key.toLowerCase() === 'enter' || key.toLowerCase() === 'return') submitFunction(textInput.value);
    });
    interfaceElements.push(textInput);

    const subButton = document.createElement('button');
    subButton.innerText = "submit";
    subButton.addEventListener('click', event => {
        submitFunction(textInput.value);
    });
    interfaceElements.push(subButton);

    messageArea.innerHTML = message;
    messageArea.appendChild(textInput);
    messageArea.appendChild(subButton);
};

const userOptionsPrompt = function(message, options, callBack) {
    const messageArea = document.getElementById('messageArea');
    let interfaceElements = [];
    const hideInterfaceElements = function() {
        interfaceElements.forEach(elem => elem.parentNode.removeChild(elem))
    };
    const submitFunction = function(value) {
        // we could handle input errors in here
        hideInterfaceElements();
        callBack(value);
    };

    const selectionDiv = document.createElement('div');
    selectionDiv.id = 'selection';

    for (let optionValue in options) {
        let optionDiv = document.createElement('div');

        let radioInput = document.createElement('input');
        let optionText = document.createElement('span');
        optionText.innerText = options[optionValue];
        radioInput.type = 'radio';
        radioInput.name = 'item';
        radioInput.value = optionValue;
        radioInput.addEventListener('click', event => {
            submitFunction(radioInput.value);
        });
        optionDiv.appendChild(radioInput);
        optionDiv.appendChild(optionText);
        selectionDiv.appendChild(optionDiv);
    }

    messageArea.innerHTML = message;
    messageArea.appendChild(selectionDiv);
};


document.addEventListener("DOMContentLoaded", function() {
    const actionsButton = document.getElementById('expandActions');
    actionsButton.addEventListener("click",function() { toggle('char-actions') })
});

