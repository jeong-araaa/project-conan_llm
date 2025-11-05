/** 
  Jeong A Ra JS
  http://jeongara.com/
**/
/*

        테이블 JS

*/
function initResponsiveTables(){
  document.querySelectorAll('.table--responsive').forEach(table => {
    const heads = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
    table.querySelectorAll('tbody tr').forEach(tr => {
      tr.querySelectorAll('td').forEach((td, i) => {
        if (!td.hasAttribute('data-th')) {
          td.setAttribute('data-th', heads[i] || '');
        }
      });
    });
  });
}


/* ======================================================
 * 부팅
 * ====================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initResponsiveTables();
});