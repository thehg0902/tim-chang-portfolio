(() => {
  const form = document.getElementById('questionnaireForm');
  const submitBtn = document.getElementById('submitBtn');
  const successMsg = document.getElementById('successMessage');
  const progressBar = document.getElementById('scrollProgress');

  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (h > 0) progressBar.style.width = (window.scrollY / h * 100) + '%';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.fullName.value.trim();
    const email = form.email.value.trim();
    const desc = form.description.value.trim();
    const services = form.querySelectorAll('input[name="services"]:checked');

    let valid = true;
    form.querySelectorAll('.q-error').forEach(el => el.classList.remove('q-error'));

    if (!name) { form.fullName.classList.add('q-error'); valid = false; }
    if (!email || !email.includes('@')) { form.email.classList.add('q-error'); valid = false; }
    if (services.length === 0) { valid = false; }
    if (!desc) { form.description.classList.add('q-error'); valid = false; }

    if (!valid) {
      const first = form.querySelector('.q-error');
      if (first) first.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    setTimeout(() => {
      form.style.display = 'none';
      document.querySelector('.q-header').style.display = 'none';
      successMsg.hidden = false;
    }, 800);
  });

  form.querySelectorAll('.q-input').forEach(input => {
    input.addEventListener('input', () => input.classList.remove('q-error'));
  });
})();
