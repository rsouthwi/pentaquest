
const toggle = function(elemClass) {
    const elements = document.getElementsByClassName(elemClass);
    const changeVisibility = function(elem) {
        elem.style.visibility = getComputedStyle(elem, null).visibility === "hidden" ? "visible" : "hidden";
    };
    [...elements].forEach(elem => changeVisibility(elem));
};

const userTextPropmt = function(message, callBack) {
    const messageArea = document.getElementById('messageArea');

    let interfaceElements = [];
    const hideInterfaceElements = function() {
        for (let i=0; i<interfaceElements.length; ++i) {
            interfaceElements[i].parentNode.removeChild(interfaceElements[i])
        }
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
        for (let i=0; i<interfaceElements.length; ++i) {
            interfaceElements[i].parentNode.removeChild(interfaceElements[i])
        }
    };
    const submitFunction = function(value) {
        // we could handle input errors in here
        hideInterfaceElements();
        callBack(value);
    };

};


(function() {
    const actionsButton = document.getElementById('expandActions');
    actionsButton.addEventListener("click",function() { toggle('char-actions') })
})();