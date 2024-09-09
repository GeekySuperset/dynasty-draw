/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './main.js'],
    theme: {
        extend: {
            fontFamily: {
                cfbheadlines: ['"CFBHeadlines"', 'sans-serif'],
                cfbbody: ['"CFBBody"', 'sans-serif'],
                cfbsubheading: ['"CFBSubheading"', 'sans-serif'],
            },
            colors: {
                'campus-yellow': '#ffff3c',
                'campus-black': '#252525',
            },
        },
    },
    plugins: [],
};
