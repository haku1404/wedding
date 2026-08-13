/**
 * Temporary material tuning panel, shown only for index.html?mat=1.
 *
 * The GLB's material names carry no meaning, so rather than guessing which
 * `aiStandardSurface*` is a column and which is a blossom, this puts every
 * material on screen with a colour picker: tap, watch the gate change, move
 * on. "Sao chép cấu hình" then prints a ready-to-paste table for
 * js/scene/materials.js.
 *
 * Never rendered on the real page — no query param, no panel.
 */

const PANEL_ID = 'mat-panel';

function styleSheet() {
  return `
    #${PANEL_ID} {
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 10000;
      width: 260px;
      max-height: 80vh;
      overflow-y: auto;
      padding: 12px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.94);
      box-shadow: 0 8px 24px rgba(74, 66, 56, 0.25);
      font: 12px/1.4 system-ui, sans-serif;
      color: #4A4238;
    }
    #${PANEL_ID} h4 { margin: 0 0 8px; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; }
    #${PANEL_ID} .row { padding: 6px 0; border-top: 1px solid rgba(74, 66, 56, 0.12); }
    #${PANEL_ID} .row:first-of-type { border-top: 0; }
    #${PANEL_ID} .name { display: block; font-weight: 600; word-break: break-all; }
    #${PANEL_ID} .ctrl { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
    #${PANEL_ID} input[type="range"] { flex: 1; }
    #${PANEL_ID} button {
      width: 100%;
      margin-top: 10px;
      padding: 8px;
      border-radius: 999px;
      background: #B48A6A;
      color: #fff;
      font: inherit;
      cursor: pointer;
      border: 0;
    }
  `;
}

export function mountMaterialPanel(materialsByName) {
  if (document.getElementById(PANEL_ID)) return;

  const style = document.createElement('style');
  style.textContent = styleSheet();
  document.head.appendChild(style);

  const panel = document.createElement('aside');
  panel.id = PANEL_ID;

  const heading = document.createElement('h4');
  heading.textContent = 'Material · ?mat=1';
  panel.appendChild(heading);

  const entries = [...materialsByName.entries()];

  entries.forEach(([originalName, material]) => {
    const row = document.createElement('div');
    row.className = 'row';

    const label = document.createElement('span');
    label.className = 'name';
    label.textContent = originalName;
    row.appendChild(label);

    const colorCtrl = document.createElement('div');
    colorCtrl.className = 'ctrl';
    const color = document.createElement('input');
    color.type = 'color';
    color.value = `#${material.color.getHexString()}`;
    color.addEventListener('input', () => material.color.set(color.value));
    colorCtrl.append('màu', color);
    row.appendChild(colorCtrl);

    const makeSlider = (labelText, property) => {
      const wrap = document.createElement('div');
      wrap.className = 'ctrl';
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = '0';
      slider.max = '1';
      slider.step = '0.05';
      slider.value = String(material[property]);
      slider.addEventListener('input', () => {
        material[property] = Number(slider.value);
      });
      wrap.append(labelText, slider);
      row.appendChild(wrap);
    };

    makeSlider('nhám', 'roughness');
    makeSlider('kim loại', 'metalness');

    panel.appendChild(row);
  });

  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Sao chép cấu hình';
  copyBtn.addEventListener('click', () => {
    const config = {};
    entries.forEach(([originalName, material]) => {
      config[originalName] = {
        color: `#${material.color.getHexString().toUpperCase()}`,
        roughness: Number(material.roughness.toFixed(2)),
        metalness: Number(material.metalness.toFixed(2))
      };
    });

    const text = JSON.stringify(config, null, 2);
    console.log('[mat-panel] config\n' + text);
    navigator.clipboard?.writeText(text).catch(() => {});
    copyBtn.textContent = 'Đã chép — xem console';
  });

  panel.appendChild(copyBtn);
  document.body.appendChild(panel);
}
