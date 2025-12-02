export function parseCSVLine(line) {
    const out = [];
    let cur = "", inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];

        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                cur += '"'; i++;
            }
            else {
                inQuotes = !inQuotes;
            }
        } else if (ch === ',' && !inQuotes) {
            out.push(cur); cur = "";
        } else {
            cur += ch;
        }
    }

    out.push(cur);
    return out;
}

export function toCSVLine(fields) {
    return fields.map(f => {
        let s = String(f);
    
        if (s.includes('"')) {
            s = s.replace(/"/g, '""');
        }
   
        if (/[",\n]/.test(s)) {
            s = `"${s}"`;
        }

        return s;
    }).join(',');
}
