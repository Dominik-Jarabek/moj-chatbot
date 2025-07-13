// Rozbalovací sekce (zůstává stejné)
document.querySelectorAll('.expand-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const target = document.getElementById(this.dataset.expand);
    if (target.classList.contains('active')) {
      target.classList.remove('active');
    } else {
      document.querySelectorAll('.expand-section').forEach(sec => sec.classList.remove('active'));
      target.classList.add('active');
    }
  });
});

// Navigační scroll
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const targetId = btn.getAttribute('data-target');
    const anchor = document.getElementById(targetId);
    if (anchor) {
      anchor.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  });
});

// Vyjížděcí kontakty - pouze v rámci horního panelu
const contactsDropdown = document.getElementById('contacts-dropdown');
const showContactsBtn = document.querySelector('.show-contacts-btn');
const topPanel = document.getElementById('top-panel');

// Hover na panel (desktop)
topPanel.addEventListener('mouseenter', showContacts);
topPanel.addEventListener('mouseleave', hideContacts);

// Klik na tlačítko (mobil/tablet)
if (showContactsBtn) {
  showContactsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    contactsDropdown.classList.toggle('dropdown-visible');
    showContactsBtn.setAttribute(
      'aria-expanded',
      contactsDropdown.classList.contains('dropdown-visible') ? 'true' : 'false'
    );
  });
}

// Kliknutí mimo kontakty (pro jejich zavření)
document.addEventListener('click', (e) => {
  if (
    !contactsDropdown.contains(e.target) &&
    !topPanel.contains(e.target)
  ) {
    hideContacts();
  }
});

function showContacts() {
  contactsDropdown.classList.add('dropdown-visible');
}
function hideContacts() {
  contactsDropdown.classList.remove('dropdown-visible');
}

// Rychlý únik
function quickExit() {
  window.location.href = "https://www.google.com";
}

document.addEventListener('DOMContentLoaded', function() {
  var btn = document.getElementById('showContactsBtn');
  var dropdown = document.getElementById('contacts-dropdown');

  if (btn && dropdown) {
    btn.addEventListener('click', function(e) {
      dropdown.classList.toggle('active');
      if (dropdown.classList.contains('active')) {
        btn.textContent = "Skrýt kontakty";
      } else {
        btn.textContent = "Zobrazit kontakty";
      }
    });
  }

  // Zavřít kontakty při kliknutí mimo, ale jen na mobilu
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 700) {
      if (
        dropdown.classList.contains('active') &&
        !dropdown.contains(e.target) &&
        e.target !== btn
      ) {
        dropdown.classList.remove('active');
        btn.textContent = "Zobrazit kontakty";
      }
    }
  });
});
document.addEventListener('DOMContentLoaded', function() {
  var btn = document.getElementById('showContactsBtn');
  var dropdown = document.getElementById('contacts-dropdown');

  if (btn && dropdown) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdown.classList.toggle('active');
      if (dropdown.classList.contains('active')) {
        btn.textContent = "Skrýt kontakty";
      } else {
        btn.textContent = "Zobrazit kontakty";
      }
    });

    document.addEventListener('click', function(e) {
      if (window.innerWidth <= 700) {
        if (
          dropdown.classList.contains('active') &&
          !dropdown.contains(e.target) &&
          e.target !== btn
        ) {
          dropdown.classList.remove('active');
          btn.textContent = "Zobrazit kontakty";
        }
      }
    });
  }
});
