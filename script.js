const addressInput = document.getElementById('address-input');
const dynamicPlaceholder = document.getElementById('dynamic-placeholder');
let autocompleteService;

// Initialize Google Places Autocomplete
function initAutocomplete() {
  // Initialize the AutocompleteService object
  autocompleteService = new google.maps.places.AutocompleteService();

  // Create the autocomplete object for the input field, restricting the search to geographical location types
  const autocomplete = new google.maps.places.Autocomplete(addressInput, { types: ['geocode'] });

  // Add listener for the place_changed event on the autocomplete object
  autocomplete.addListener('place_changed', function() {
    const place = autocomplete.getPlace();
    if (!place.geometry) {
      console.log("No details available for input: '" + place.name + "'");
      return;
    }

    // Set the input field value to the selected place's formatted address or name
    addressInput.value = place.formatted_address || place.name;
    dynamicPlaceholder.textContent = ''; // Clear dynamic placeholder on selection
  });

  // Listen to input events on the addressInput field to update the dynamic placeholder
  addressInput.addEventListener('input', updatePlaceholderWithFirstPrediction);
}

// Update the dynamic placeholder with the first address prediction
function updatePlaceholderWithFirstPrediction() {
  const inputText = addressInput.value; // Keep trailing spaces
  const trimmedInputText = inputText.trimEnd(); // Trim only trailing spaces for matching

  // Clear dynamic placeholder if input is empty
  if (trimmedInputText === '') {
    dynamicPlaceholder.textContent = '';
    dynamicPlaceholder.style.marginLeft = '0';
    return;
  }

  autocompleteService.getPlacePredictions({ input: trimmedInputText, types: ['geocode'] }, (predictions, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
      const firstPrediction = predictions[0].description;
      const indexOfInputText = firstPrediction.toLowerCase().indexOf(trimmedInputText.toLowerCase());
      if (indexOfInputText !== -1) {
        const matchEnd = indexOfInputText + trimmedInputText.length;
        // Ensure a space is included if the last character of the input is a space
        const extraSpace = inputText.endsWith(' ') ? ' ' : '';
        const suggestionRest = extraSpace + firstPrediction.substring(matchEnd);
        dynamicPlaceholder.textContent = suggestionRest;

        // Measure the width of the entered text and update the margin of the dynamic placeholder
        const textWidth = measureTextWidth(inputText, addressInput);
        dynamicPlaceholder.style.marginLeft = `${textWidth}px`;
      } else {
        dynamicPlaceholder.textContent = '';
        dynamicPlaceholder.style.marginLeft = '0';
      }
    } else {
      dynamicPlaceholder.textContent = '';
      dynamicPlaceholder.style.marginLeft = '0';
    }
  });
}

// The rest of your JavaScript remains unchanged...


function measureTextWidth(text, inputElement) {
  // Use a non-breaking space for measurement to preserve trailing spaces
  const textWithNonBreakingSpaces = text.replace(/ /g, '\u00A0');

  // Create a temporary span element to measure text width
  const span = document.createElement('span');
  document.body.appendChild(span);

  // Copy input styling to ensure consistent measurement
  span.style.fontFamily = getComputedStyle(inputElement).fontFamily;
  span.style.fontSize = getComputedStyle(inputElement).fontSize;
  span.style.fontWeight = getComputedStyle(inputElement).fontWeight;
  span.style.letterSpacing = getComputedStyle(inputElement).letterSpacing;
  span.style.whiteSpace = 'pre'; // Preserve whitespace and newlines

  // Add the modified text to the span and measure its width
  span.textContent = textWithNonBreakingSpaces;
  const width = span.offsetWidth;

  // Clean up by removing the temporary span
  document.body.removeChild(span);

  return width;
}





// Initialize autocomplete when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initAutocomplete);
