/**
 * To change the icons, modify the SVGs in `./resources`, execute `npx svgo -f resources --datauri enc -o dist`,
 * and then replace respective icons with the optimized data URIs in `./dist`.
 */
var icons = {
  horizontal: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 1800">
                <polyline points="450 400 450 150 1350 150 1350 400" style="fill:none;stroke:currentColor;stroke-width:100;stroke-linejoin:round;"/>
                <rect x="150" y="450" width="600" height="1200" rx="1" style="fill:none;stroke:currentColor;stroke-width:100;"></rect>
                <rect x="1050" y="450" width="600" height="800" rx="1" style="fill:currentColor;stroke:currentColor;stroke-width:100;opacity:.5;"></rect>
              </svg>`,
  vertical: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 1800">
              <polyline points="400 1350 150 1350 150 450 400 450" style="fill:none;stroke:currentColor;stroke-width:100;stroke-linejoin:round;"/>
              <rect x="450" y="150" width="1200" height="600" rx="1" style="fill:none;stroke:currentColor;stroke-width:100;"></rect>
              <rect x="450" y="1050" width="800" height="600" rx="1" style="fill:currentColor;stroke:currentColor;stroke-width:100;opacity:.5;"></rect>
            </svg>`
};

export default icons;
