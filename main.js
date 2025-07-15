const HQ = "5172 Beacon Dr, Irondale AL 35210";

function toggleDropoff() {
  const service = document.getElementById('service').value;
  const dropoff = document.getElementById('dropoff-container');
  if (service === 'tow') {
    dropoff.classList.remove('hidden');
  } else {
    dropoff.classList.add('hidden');
  }
}

function autoFillPickup() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const geocoder = new google.maps.Geocoder();
      const latlng = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === "OK" && results[0]) {
          document.getElementById('pickup').value = results[0].formatted_address;
        }
      });
    });
  }
}

function calculateDistanceMatrix(origins, destinations, callback) {
  const service = new google.maps.DistanceMatrixService();
  service.getDistanceMatrix(
    {
      origins,
      destinations,
      travelMode: google.maps.TravelMode.DRIVING
    },
    callback
  );
}

function showQuote() {
  const pickup = document.getElementById('pickup').value;
  const dropoff = document.getElementById('dropoff').value;
  const service = document.getElementById('service').value;

  if (!pickup || !service || (service === 'tow' && !dropoff)) {
    alert("Please complete all fields.");
    return;
  }

  const quoteBox = document.getElementById('quote');
  let total = 140;

  calculateDistanceMatrix([HQ], [pickup], (response1, status1) => {
    if (status1 === "OK") {
      const enrouteMiles = response1.rows[0].elements[0].distance.value / 1609.34;
      total += enrouteMiles * 2;

      if (service === 'tow') {
        calculateDistanceMatrix([pickup], [dropoff], (response2, status2) => {
          if (status2 === "OK") {
            const towMiles = response2.rows[0].elements[0].distance.value / 1609.34;
            total += towMiles * 3;
            quoteBox.innerHTML = `Estimated Quote: $${Math.round(total)}`;
            quoteBox.classList.remove('hidden');
          }
        });
      } else {
        quoteBox.innerHTML = `Estimated Quote: $${Math.round(total)}`;
        quoteBox.classList.remove('hidden');
      }
    }
  });
}

document.getElementById('service').addEventListener('change', () => {
  document.getElementById('quote').classList.add('hidden');
});
document.getElementById('pickup').addEventListener('blur', showQuote);
document.getElementById('dropoff').addEventListener('blur', showQuote);
