(() => {
  const form = document.getElementById('questionnaireForm');
  const submitBtn = document.getElementById('submitBtn');
  const successMsg = document.getElementById('successMessage');
  const progressBar = document.getElementById('scrollProgress');

  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (h > 0) progressBar.style.width = (window.scrollY / h * 100) + '%';
  }, { passive: true });

  function revealStep(stepEl) {
    stepEl.classList.remove('q-step-hidden');
    stepEl.classList.add('q-step-reveal');
    setTimeout(() => {
      stepEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      var firstInput = stepEl.querySelector('.q-input, .q-textarea, .q-select');
      if (firstInput) firstInput.focus({ preventScroll: true });
    }, 100);
  }

  function clearErrors(container) {
    container.querySelectorAll('.q-error').forEach(function (el) {
      el.classList.remove('q-error');
    });
  }

  // Step 1 → Step 2
  document.getElementById('nextStep1').addEventListener('click', function () {
    var step1 = document.getElementById('step1');
    clearErrors(step1);
    var name = form.fullName.value.trim();
    var services = step1.querySelectorAll('input[name="services"]:checked');
    var valid = true;

    if (!name) { form.fullName.classList.add('q-error'); valid = false; }
    if (services.length === 0) {
      step1.querySelector('.q-checkbox-group').classList.add('q-error');
      valid = false;
    }

    if (!valid) {
      var first = step1.querySelector('.q-error');
      if (first && first.focus) first.focus();
      return;
    }

    revealStep(document.getElementById('step2'));
  });

  // Step 2 → Step 3
  document.getElementById('nextStep2').addEventListener('click', function () {
    var step2 = document.getElementById('step2');
    clearErrors(step2);
    var desc = form.description.value.trim();
    var valid = true;

    if (!desc) { form.description.classList.add('q-error'); valid = false; }

    if (!valid) {
      form.description.focus();
      return;
    }

    revealStep(document.getElementById('step3'));
  });

  // Step 3 → Step 4
  document.getElementById('nextStep3').addEventListener('click', function () {
    revealStep(document.getElementById('step4'));
  });

  // Submit
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var step4 = document.getElementById('step4');
    clearErrors(step4);
    var email = form.email.value.trim();
    var valid = true;

    if (!email || !email.includes('@')) { form.email.classList.add('q-error'); valid = false; }

    if (!valid) {
      form.email.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    setTimeout(function () {
      form.style.display = 'none';
      document.querySelector('.q-header').style.display = 'none';
      successMsg.hidden = false;
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 800);
  });

  // Clear error on input
  form.querySelectorAll('.q-input').forEach(function (input) {
    input.addEventListener('input', function () { input.classList.remove('q-error'); });
  });

  // Clear checkbox group error on change
  form.querySelectorAll('input[name="services"]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      var group = cb.closest('.q-checkbox-group');
      if (group) group.classList.remove('q-error');
    });
  });
})();
