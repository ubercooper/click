// Persistent navigation — contracts/routes-and-screens.md
import { icons } from '../icons.js';

const ITEMS = [
  { screen: 'dashboard', href: '#/dashboard', label: 'Home', icon: icons.home },
  { screen: 'profile', href: '#/profile', label: 'Profile', icon: icons.user },
  { screen: 'log', href: '#/log', label: 'Log', icon: icons.book },
];

let navEl = null;

export function mountNav(el) {
  navEl = el;
  el.innerHTML = `<ul class="nav__list">${ITEMS.map(
    (item) => `<li><a class="nav__link" href="${item.href}" data-screen="${item.screen}">${item.icon}<span>${item.label}</span></a></li>`,
  ).join('')}</ul>`;
}

export function setActive(screen) {
  navEl?.querySelectorAll('.nav__link').forEach((link) => {
    if (link.dataset.screen === screen) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}
