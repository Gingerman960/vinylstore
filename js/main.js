import {productsData} from "../config/data";
const jquery = require("jquery");
window.$ = window.jQuery = jquery;
require("jquery-ui-dist/jquery-ui.js");
import smallImages from "../assets/covers/small/*.jpeg";
import largeImages from "../assets/covers/large/*.jpeg";

const decades = [
  '1950-60', '1960-70', '1970-80', '1980-90', '1990-00', '2000-10', '2010-20', '2020-30'
]
const genres = new Set();
const countries = new Set();

const urlParams = new URLSearchParams(window.location.search);
const page = urlParams.get('page') || 1;
const artist = urlParams.get('artist');
const genre = urlParams.get('genre');
const decade = urlParams.get('decade');
const country = urlParams.get('country');
let favList = [];
let cart = [];
if (localStorage.getItem('favList')) {
  favList = JSON.parse(localStorage.getItem('favList'));
}
if (localStorage.getItem('cart')) {
  cart = JSON.parse(localStorage.getItem('cart'));
}
let products = productsData.map(product => {
  if (favList.includes(product.id)) {
    product.liked = true;
  }
  if (cart.includes(product.id)) {
    product.inCart = true;
  }
  return product;
});

productsData.forEach(c => {
  countries.add(c.country);
  const parsedGenres = c.style.split(', ');
  parsedGenres.forEach(g => genres.add(g));
});

function back() {
  history.back();
}

function search() {
  let url = '';
  const searchPayload = {
    artist: $('#artist').val(),
    genre: $('#genre').val(),
    decade: $('#decade').val(),
    country: $('#country').val()
  }
  Object.keys(searchPayload).forEach((key, index) => {
    if (searchPayload[key]) {
      url += url.length ? '&' : '?';
      url += `${key}=${searchPayload[key]}`;
    }
  });

  window.location.href = url || '/';
}

document.addEventListener('DOMContentLoaded', function() {
  let itemsPerPage = 6;

  if (window.innerWidth > 1024) {
    itemsPerPage = 12;
  }
  generateOptions(decades, 'decade');
  generateOptions(Array.from(countries), 'country');
  generateOptions(Array.from(genres), 'genre');

  $("#nav-back").click(function() {
    back()
  });
  $("#submitSearch").click(function(event) {
    event.preventDefault();
    search()
  });
  $('.products').on('click', '.add-to-cart', function(event) {
    let selector = event.currentTarget;
    const id = Number(selector.id.slice(11));
    const index = cart.indexOf(id);

    if (index !== -1) {
      cart.splice(index, 1);
    } else {
      cart.push(id);
    }

    $(selector).toggleClass('inCart');
    localStorage.setItem('cart', JSON.stringify(cart));
  });
  $('.products').on('click', '.like-button', function(event) {
    let selector = event.currentTarget;
    const id = Number(selector.id.slice(12));
    const index = favList.indexOf(id);

    if (index !== -1) {
      favList.splice(index, 1);
    } else {
      favList.push(id);
    }
    $(selector).toggleClass('liked');
    localStorage.setItem('favList', JSON.stringify(favList));
  });
  $('.pagination').on('click', '.pageNumber', function(event) {
    const pageNumber = event.target.innerText;
    const searchParams = window.location.search;
    let url = '';
    if (searchParams) {
      if (searchParams.includes('page=')) {
        url = searchParams.replace(/page=\d+/g, '');
      } else {
        url = searchParams + `&`;
      }
    } else {
      url = '?';
    }

    url = url + `page=${pageNumber}`;
    window.location.href = url;
  });
  $("#artist").on("input", function() {
    const value = $(this).val()
    if (value.length > 10) {
      $(this).addClass('is-invalid');
      $('.search-form').addClass('has-errors');
    } else {
      $(this).removeClass('is-invalid');
      $('.search-form').removeClass('has-errors');
    }
  });


  if (artist) {
    $('#artist').val(artist);
    products = products.filter(p => p.author.toLowerCase().includes(artist.toLowerCase()));
  }
  if (genre) {
    $('#genre').val(genre);
    products = products.filter(p => p.style.includes(genre));
  }
  if (decade) {
    $('#decade').val(decade);
    const year = Number(decade.split('-')[0]);
    products = products.filter(p => p.year >= year && p.year <= year + 10);
  }
  if (country) {
    $('#country').val(country);
    products = products.filter(p => p.country.includes(country));
  }

  generatePagination(products, itemsPerPage, page);
  products = products.slice(itemsPerPage * (page - 1), itemsPerPage * (page-1) + itemsPerPage);
  generateProducts(products);
});

function generateOptions(options, selector) {
  const select = document.getElementById(selector);
  for (let i = 0; i < options.length; i++){
    const opt = document.createElement('option');
    opt.value = options[i];
    opt.innerHTML = options[i];
    select.appendChild(opt);
  }
}

function generateProducts(prod) {
  const parent = document.getElementById('products');
  let content = '';

  prod.forEach(p => {
    const smallImage = smallImages[p['albumCoverName']];
    const largeImage = largeImages[p['albumCoverName']];

    content += `
      <div class="product">
        <div class="cover">
          <div class="like-button ${p.liked ? 'liked': ''}" id="like-button-${p.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="4" fill="white"/>
            <path d="M19 10.6617C19 14.2167 12.5 17.9998 12.5 17.9998C12.5 17.9998 6 14.2167 6 10.6617C6 5.83488 12.5 5.90006 12.5 10.1481C12.5 5.90006 19 5.96361 19 10.6617Z" stroke="black" stroke-width="1.10308" stroke-linejoin="round"/>
            </svg>
          </div>
          <img srcset="${smallImage}, ${largeImage} 2x"
            src="${require("../img/placeholder.jpeg")}" alt="cover" />
        </div>
        <div class="name">${p.name}</div>
        <div class="author">${p.author}</div>
        <div class="description">
          <span class="record-info">Year :</span>
          <span class="record-info">${p.year}</span>
        </div>
        <div class="description">
          <span class="record-info">Style :</span>
          <span class="record-info">${p.style}</span>
        </div>
        <div class="description">
          <span class="record-info">Country :</span>
          <span class="record-info">${p.country}</span>
        </div>
        <button id="add-to-cart${p.id}" class="btn btn-primary add-to-cart ${p.inCart ? 'inCart' : ''}">
            <span class="plus-sign">Add</span>
        </button>
      </div>`
  });
  parent.innerHTML = content;
}

function generatePagination(items, perPage, currentPage) {
  const parent = document.getElementById('pagination');
  const pagesTotal = Math.ceil(items.length / perPage);
  let pages = '';
  for (let i = 1; i <= pagesTotal; i++) {
    let pageButton = '';

    if (Number(currentPage) === i) {
      pageButton = `<div class="pageNumber active">${i}</div>`
    } else {
      pageButton = `<div class="pageNumber">${i}</div>`
    }
    pages += pageButton;
  }
  parent.innerHTML = pages;
}
