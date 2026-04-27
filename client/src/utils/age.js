/** Birth: May 11, 2005 at local midnight */
export const BIRTH = new Date(2005, 4, 11, 0, 0, 0, 0);

export function ageBreakdown(now = new Date()) {
  const birth = BIRTH;
  let y = now.getFullYear() - birth.getFullYear();
  let mo = now.getMonth() - birth.getMonth();
  let d = now.getDate() - birth.getDate();
  let h = now.getHours() - birth.getHours();
  let mi = now.getMinutes() - birth.getMinutes();
  let s = now.getSeconds() - birth.getSeconds();

  if (s < 0) {
    s += 60;
    mi -= 1;
  }
  if (mi < 0) {
    mi += 60;
    h -= 1;
  }
  if (h < 0) {
    h += 24;
    d -= 1;
  }
  if (d < 0) {
    const prevMonthLast = new Date(now.getFullYear(), now.getMonth(), 0);
    d += prevMonthLast.getDate();
    mo -= 1;
  }
  if (mo < 0) {
    mo += 12;
    y -= 1;
  }

  return { years: y, months: mo, days: d, hours: h, minutes: mi, seconds: s };
}
