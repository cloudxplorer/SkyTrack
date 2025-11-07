Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MDU2YzAyNS1hNTk4LTRkMGEtOWUwMS1mYmJmOGZiM2M5MzMiLCJpZCI6MzU2NDY2LCJpYXQiOjE3NjIxNDIwNjR9.x4N3h6Q69m8dn1rvB2ACqRGVrOXf9Ft-vmCBYoyyqnU';

const viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: Cesium.createWorldTerrain(),
    animation: false,
    timeline: false,
    homeButton: false,
    geocoder: false,
    baseLayerPicker: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    fullscreenButton: false,
    infoBox: false,
    selectionIndicator: false,
    creditContainer: document.createElement('div')
});

viewer.scene.globe.enableLighting = true;
viewer.scene.globe.depthTestAgainstTerrain = true;
viewer.clock.multiplier = 2;

viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(0, 0, 25000000)
});

let allSatellites = new Map();
let satelliteEntities = new Map();
let totalSatellites = 0;

async function loadSatellites() {
    try {
        document.getElementById('loadingText').textContent = 'Loading all satellites data...';
        document.getElementById('loadingPanel').style.display = 'block';

        const urls = [
            "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle"
        ];

        const allTLE = [];
        for (const url of urls) {
            const res = await fetch(url);
            const text = await res.text();
            allTLE.push(...text.trim().split("\n"));
        }

        const satellites = [];
        for (let i = 0; i < allTLE.length; i += 3) {
            if (i + 2 >= allTLE.length) break;
            
            const name = allTLE[i].trim();
            const tleLine1 = allTLE[i + 1];
            const tleLine2 = allTLE[i + 2];
            
            if (name && tleLine1 && tleLine2) {
                satellites.push({ name, tleLine1, tleLine2 });
            }
        }

        totalSatellites = satellites.length;

        let loadedCount = 0;
        let errorCount = 0;
        const batchSize = 100;
        
        async function processBatch(startIndex) {
            const endIndex = Math.min(startIndex + batchSize, satellites.length);
            
            for (let i = startIndex; i < endIndex; i++) {
                const sat = satellites[i];
                try {
                    const satrec = satellite.twoline2satrec(sat.tleLine1, sat.tleLine2);
                    const noradId = sat.tleLine1.substring(2, 7).trim();
                    
                    allSatellites.set(noradId, {
                        name: sat.name,
                        noradId: noradId,
                        tleLine1: sat.tleLine1,
                        tleLine2: sat.tleLine2,
                        satrec: satrec,
                        category: classifySatellite(sat.name)
                    });

                    const entity = viewer.entities.add({
                        name: noradId,
                        description: sat.name,
                        position: new Cesium.CallbackProperty(function(time, result) {
                            const date = new Date();
                            try {
                                const positionAndVelocity = satellite.propagate(satrec, date);
                                const positionEci = positionAndVelocity.position;
                                
                                if (positionEci) {
                                    const gmst = satellite.gstime(date);
                                    const positionGd = satellite.eciToGeodetic(positionEci, gmst);
                                    
                                    const longitude = Cesium.Math.toDegrees(positionGd.longitude);
                                    const latitude = Cesium.Math.toDegrees(positionGd.latitude);
                                    const height = positionGd.height * 1000;
                                    
                                    return Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
                                }
                            } catch (e) {
                                return result;
                            }
                            return result;
                        }, false),
                        point: {
                            pixelSize: getSatelliteSize(sat.name),
                            color: getSatelliteColor(sat.name),
                            outlineColor: Cesium.Color.BLACK,
                            outlineWidth: 1,
                            heightReference: Cesium.HeightReference.NONE,
                            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 8.0e6, 0.5)
                        }
                    });

                    satelliteEntities.set(noradId, entity);
                    loadedCount++;

                } catch (error) {
                    errorCount++;
                }

                if (loadedCount % 50 === 0) {
                    document.getElementById('loadingText').textContent = `Loading satellites... ${loadedCount}/${satellites.length}`;
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }

            if (endIndex < satellites.length) {
                setTimeout(() => processBatch(endIndex), 100);
            } else {
                document.getElementById('loadingText').textContent = `Loaded ${loadedCount} satellites!`;
                
                setTimeout(() => {
                    document.getElementById('loadingPanel').style.display = 'none';
                }, 3000);
            }
        }

        processBatch(0);

    } catch (error) {
        document.getElementById('loadingText').textContent = 'Error loading satellite data';
        setTimeout(() => {
            document.getElementById('loadingPanel').style.display = 'none';
        }, 3000);
    }
}

function classifySatellite(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('starlink')) return 'starlink';
    if (lowerName.includes('gps')) return 'gps';
    if (lowerName.includes('galileo')) return 'galileo';
    if (lowerName.includes('glonass')) return 'glonass';
    if (lowerName.includes('iss') || lowerName.includes('tianhe') || lowerName.includes('tiangong')) return 'space-station';
    if (lowerName.includes('goes') || lowerName.includes('noaa') || lowerName.includes('meteosat') || lowerName.includes('weather')) return 'weather';
    if (lowerName.includes('intelsat') || lowerName.includes('eutelsat') || lowerName.includes('telstar') || lowerName.includes('amos')) return 'comms';
    if (lowerName.includes('hubble') || lowerName.includes('telescope')) return 'science';
    return 'other';
}

function getSatelliteColor(name) {
    const category = classifySatellite(name);
    const colors = {
        'space-station': Cesium.Color.YELLOW,
        'gps': Cesium.Color.GREEN,
        'galileo': Cesium.Color.BLUE,
        'glonass': Cesium.Color.RED,
        'starlink': Cesium.Color.CYAN,
        'weather': Cesium.Color.ORANGE,
        'comms': Cesium.Color.MAGENTA,
        'science': Cesium.Color.PURPLE,
        'other': Cesium.Color.WHITE
    };
    return colors[category] || Cesium.Color.WHITE;
}

function getSatelliteSize(name) {
    const category = classifySatellite(name);
    const sizes = {
        'space-station': 8,
        'gps': 8,
        'galileo': 8,
        'glonass': 8,
        'starlink': 8,
        'weather': 8,
        'comms': 8,
        'science': 8,
        'other': 6
    };
    return sizes[category] || 3;
}

function updateSatelliteInfo(noradId) {
    const sat = allSatellites.get(noradId);
    if (!sat) return;

    const date = new Date();
    const positionAndVelocity = satellite.propagate(sat.satrec, date);
    const positionEci = positionAndVelocity.position;

    if (positionEci) {
        const gmst = satellite.gstime(date);
        const positionGd = satellite.eciToGeodetic(positionEci, gmst);
        
        const altitude = (positionGd.height).toFixed(0);
        const latitude = Cesium.Math.toDegrees(positionGd.latitude).toFixed(2);
        const longitude = Cesium.Math.toDegrees(positionGd.longitude).toFixed(2);
        
        const speedMs = positionAndVelocity.velocity ? 
            Math.sqrt(positionAndVelocity.velocity.x**2 + positionAndVelocity.velocity.y**2 + positionAndVelocity.velocity.z**2) : 7660;
        const speedKmh = (speedMs * 3.6).toFixed(0);

        document.getElementById('infoPanel').innerHTML = `
            <div class="info-panel-content">
                <div class="satellite-name">${sat.name} #${sat.noradId}</div>
                <div class="satellite-stats">
                    <div class="stat">
                        <div class="stat-label">Speed</div>
                        <div class="stat-value">${speedKmh} km/h</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Height</div>
                        <div class="stat-value">${altitude} km</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Latitude</div>
                        <div class="stat-value">${latitude}°</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Longitude</div>
                        <div class="stat-value">${longitude}°</div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('infoPanel').style.display = 'block';
    }
}

viewer.selectedEntityChanged.addEventListener(function(entity) {
    if (entity && allSatellites.has(entity.name)) {
        updateSatelliteInfo(entity.name);
        viewer.flyTo(entity, {
            duration: 1.5,
            offset: new Cesium.HeadingPitchRange(0, -Cesium.Math.PI_OVER_FOUR, 500000)
        });
    } else {
        document.getElementById('infoPanel').style.display = 'none';
    }
});

document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const searchValue = this.value.trim().toLowerCase();
        if (searchValue === '') {
            document.getElementById('infoPanel').style.display = 'none';
            viewer.selectedEntity = undefined;
            return;
        }
        for (let [noradId, sat] of allSatellites) {
            if (sat.name.toLowerCase().includes(searchValue) || noradId.includes(searchValue)) {
                const entity = satelliteEntities.get(noradId);
                if (entity) {
                    viewer.selectedEntity = entity;
                    break;
                }
            }
        }
    }
});

window.onload = function() {
    loadSatellites();
};
