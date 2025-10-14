function showPage(pageId) {
  // Hide all sections
  document.querySelectorAll('section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');

  // Remove active highlight from all nav links
  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active-link'));

  // Add highlight to the clicked link
  const clickedLink = Array.from(document.querySelectorAll('nav a')).find(a => 
    a.getAttribute('onclick').includes(pageId)
  );
  if (clickedLink) clickedLink.classList.add('active-link');
}