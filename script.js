const IPINFO_KEY = "4672797cccbab8";

var map = L.map('map').setView([20,0], 2);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

let markers = [];
let pulseIntervals = [];

// Run OSINT for multiple IPs
function runOSINT() {
    const input = document.getElementById("ipInput").value.trim();
    if(!input) { alert("Enter IP(s)"); return; }

   const ips = input.split(/\r?\n/).map(ip => ip.trim()).filter(ip);

    markers.forEach(m => map.removeLayer(m));
    markers = [];
    pulseIntervals.forEach(i => clearInterval(i));
    pulseIntervals = [];
    document.getElementById("ipinfoCard").innerHTML = "";
    document.getElementById("osintLinks").innerHTML = "";

    ips.forEach(ip => {
        fetch(`https://ipinfo.io/${ip}/json?token=${IPINFO_KEY}`)
            .then(res => res.json())
            .then(info => {
                const [lat, lon] = info.loc ? info.loc.split(",") : [20,0];
                appendIPInfo({
                    ip: info.ip,
                    city: info.city || 'N/A',
                    region: info.region || 'N/A',
                    country: info.country || 'N/A',
                    org: info.org || 'N/A',
                    postal: info.postal || 'N/A'
                });
                plotMapMultiple(lat, lon, info.ip);
                displayOSINTCategories(ip);
            })
            .catch(err => console.error(err));
    });
}

function appendIPInfo(info) {
    const card = document.getElementById("ipinfoCard");
    card.innerHTML += `
    <div style="border-bottom:1px solid #ff4c4c; margin-bottom:10px; padding-bottom:5px;">
        <p><strong>IP:</strong> ${info.ip}</p>
        <p><strong>City:</strong> ${info.city}</p>
        <p><strong>Region:</strong> ${info.region}</p>
        <p><strong>Country:</strong> ${info.country}</p>
        <p><strong>Org:</strong> ${info.org}</p>
        <p><strong>Postal:</strong> ${info.postal}</p>
    </div>`;
}

function plotMapMultiple(lat, lon, ip) {
    const marker = L.circleMarker([lat, lon], {
        radius: 10,
        color: '#ff1a1a',
        fillColor: '#ff4c4c',
        fillOpacity: 0.7,
        weight: 2
    }).addTo(map).bindPopup(`<b>${ip}</b>`);
    markers.push(marker);

    let growing = true;
    const interval = setInterval(() => {
        let r = marker.getRadius();
        marker.setRadius(growing ? r + 0.3 : r - 0.3);
        if(r > 15) growing = false;
        if(r < 8) growing = true;
    }, 50);
    pulseIntervals.push(interval);

    if(markers.length === 1) {
        map.setView([lat, lon], 4);
    } else {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.5));
    }
}

// ================= OSINT Categories =================
function displayOSINTCategories(ip) {
    const container = document.getElementById("osintLinks");

    const categories = {
        "IP Reputation": [
            {name: "AbuseIPDB", url: `https://www.abuseipdb.com/check/${ip}`},
            {name: "VirusTotal", url: `https://www.virustotal.com/gui/ip-address/${ip}/detection`},
            {name: "Shodan", url: `https://www.shodan.io/host/${ip}`},
            {name: "GreyNoise", url: `https://www.greynoise.io/viz/ip/${ip}`}
        ],
        "Proxy/VPN/TOR": [
            {name: "IPQualityScoreVPN", url: `https://www.ipqualityscore.com/free-ip-lookup-proxy-vpn-test/lookup/${ip}`},
            {name: "VPNAPI", url: `https://vpnapi.io/api/${ip}`},
            {name: "IP2Proxy", url: `https://www.ip2location.com/demo/${ip}`}
        ],
        "Domain/URL": [
            {name: "URLVoid", url: `https://www.urlvoid.com/scan/${ip}/`},
            {name: "SecuriSiteCheck", url: `https://sitecheck.sucuri.net/results/${ip}`},
            
        ],
        "Threat Intel Platforms": [
            {name: "Xforce", url: `https://exchange.xforce.ibmcloud.com/ip/${ip}`},
            {name: "OTX", url: `https://otx.alienvault.com/indicator/ip/${ip}`},
        
        ],
        "Threat Enrichment": [
            {name: "ThreatCrowd", url: `https://www.threatcrowd.org/ip.php?ip=${ip}`},
            {name: "ThreatFox", url: `https://threatfox.abuse.ch/browse.php?search=${ip}`},
            {name: "SANS", url: `https://isc.sans.edu/ipinfo.html?ip=${ip}`}
        ],
        "Cyber Search Engines": [
            {name: "Shodan", url: `https://www.shodan.io/host/${ip}`},
            {name: "Spyse", url: `https://spyse.com/ip/${ip}`},
            {name: "Maltiverse", url: `https://maltiverse.com/intelligence/search;query=${ip}`}
        ]
    };

    for (const [cat, tools] of Object.entries(categories)) {
        const section = document.createElement("div");
        section.className = "osint-section";

        const title = document.createElement("p");
        title.innerHTML = `<strong>${ip} - ${cat}</strong>`;
        section.appendChild(title);

        tools.forEach(tool => {
            const btn = document.createElement("a");
            btn.className = "btn btn-sm m-1"; // keep custom styling, remove Bootstrap outline
            btn.target = "_blank";
            btn.href = tool.url;
            btn.innerText = tool.name;
            section.appendChild(btn);
        });

        container.appendChild(section);
    }
}

