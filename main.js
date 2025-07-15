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
    navigator.geolocation.getCurrentPosition(pos => {
      const geocoder = new google.maps.Geocoder();
      const latlng = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === "OK" && results[0]) {
          document.getElementById('pickup').value = results[0].formatted_address;
          showQuote();
        }
      });
    });
  }
}

function calculateDistance(origins, destinations, callback) {
  const service = new google.maps.DistanceMatrixService();
  service.getDistanceMatrix({
    origins,
    destinations,
    travelMode: 'DRIVING'
  }, callback);
}

function showQuote() {
  const pickup = document.getElementById('pickup').value;
  const dropoff = document.getElementById('dropoff').value;
  const service = document.getElementById('service').value;
  if (!pickup || !service || (service === 'tow' && !dropoff)) return;

  let total = 140;

  calculateDistance([HQ], [pickup], (res1, status1) => {
    if (status1 === "OK") {
      const enrouteMiles = res1.rows[0].elements[0].distance.value / 1609.34;
      total += enrouteMiles * 2;

      if (service === 'tow') {
        calculateDistance([pickup], [dropoff], (res2, status2) => {
          if (status2 === "OK") {
            const towMiles = res2.rows[0].elements[0].distance.value / 1609.34;
            total += towMiles * 3;
            displayQuote(total);
          }
        });
      } else {
        displayQuote(total);
      }
    }
  });
}

function displayQuote(amount) {
  const quoteBox = document.getElementById('quote');
  quoteBox.innerHTML = `Estimated Quote: $${Math.round(amount)}`;
  quoteBox.classList.remove('hidden');
}
