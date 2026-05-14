let scene, camera, renderer, controls;
let mixer, clock;
let currentModel;
let actions = [];
let params;
let lights;

// Run when page loads
window.addEventListener("load", function () {

  // If this is the index/home page, use the Land of Ooo background
  if (pageConfig.type === "home") {
    setPageBackground("assets/BGs/LandofOOO.jpg");
  }

  // If this is a model page, use that page's chosen background
  if (pageConfig.type === "model") {
    setPageBackground(pageConfig.background);
    init3D();
    animate();
  }
});

// Background through JavaScript
function setPageBackground(backgroundPath) {
  document.body.style.backgroundImage = `url('${backgroundPath}')`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundRepeat = "no-repeat";
  document.body.style.minHeight = "100vh";
}

// Index page buttons
function goToPage(pageName) {
  window.location.href = pageName;
}

// 3D model page setup
function init3D() {
  clock = new THREE.Clock();

  scene = new THREE.Scene();

  const canvas = document.getElementById("threeCanvas");

  camera = new THREE.PerspectiveCamera(
    60,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );

  camera.position.set(0, 2, 8);

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });

  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  setupLightingGUI();

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.update();

  loadModel(pageConfig.startModel, false);

  window.addEventListener("resize", onResize);
}

function loadModel(fileName, autoPlay = false) {
  const loader = new THREE.GLTFLoader();

  if (currentModel) {
    scene.remove(currentModel);
    currentModel = null;
    mixer = null;
    actions = [];
  }

  loader.load(
    fileName,

    function (gltf) {
      currentModel = gltf.scene;

      currentModel.position.set(0, 0, 0);
      currentModel.rotation.set(0, 0, 0);
      currentModel.scale.set(1, 1, 1);

      scene.add(currentModel);
      fitModelToScene(currentModel);

      mixer = new THREE.AnimationMixer(currentModel);
      actions = [];

      gltf.animations.forEach(function (clip) {
        const action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        actions.push(action);
      });

      if (autoPlay && actions.length > 0) {
        actions[0].reset();
        actions[0].play();
      }

      console.log("Loaded:", fileName);
      console.log("Animations:", gltf.animations.map(a => a.name));
    },

    undefined,

    function (error) {
      console.error("Model failed to load:", error);
    }
  );
}

function playAnimation() {
  if (actions.length === 0) {
    console.warn("No animation found.");
    return;
  }

  actions[0].reset();
  actions[0].timeScale = 1;
  actions[0].play();
}

function fitModelToScene(model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();

  box.getSize(size);
  box.getCenter(center);

  model.position.x -= center.x;
  model.position.y -= center.y;
  model.position.z -= center.z;

  const maxSize = Math.max(size.x, size.y, size.z);
  const scale = 3 / maxSize;

  model.scale.set(scale, scale, scale);
  model.position.y += 1.5;
}

function animate() {
  requestAnimationFrame(animate);

  if (mixer) {
    mixer.update(clock.getDelta());
  }

  controls.update();


  if (params && params.spot.moving) {
  const time = clock.getElapsedTime();
  lights.spot.position.x = Math.sin(time) * 5;
  lights.spotHelper.update();
  }

  if (lights && lights.spotHelper) {
    lights.spotHelper.update();
  }
  renderer.render(scene, camera);
}

function onResize() {
  const canvas = document.getElementById("threeCanvas");

  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}


function showToast(message) {
  const toastBox = document.getElementById("bmoToast");
  const toastMessage = document.getElementById("toastMessage");

  if (!toastBox || !toastMessage) return;

  toastMessage.innerText = message;

  const toast = new bootstrap.Toast(toastBox);
  toast.show();
}

function loadBmoWave() {
  loadModel("assets/models/BMOwave.glb", true);
  showToast("BMO Wave loaded");
}

function loadBmoAngry() {
  loadModel("assets/models/BMOangry.glb", true);
  showToast("BMO Angry Mode loaded");

  setTimeout(function () {
    tintBmoFaceRed();
  }, 500);
}

function setCameraFront() {
  camera.position.set(0, 2, 5);
  camera.lookAt(0, 1, 0);
  showToast("Front view selected");
}

function setCameraClose() {
  camera.position.set(0, 1.2, 2.5);
  camera.lookAt(0, 1, 0);
  showToast("Close-up camera view");
}

let wireframeOn = false;

function toggleWireframe() {
  if (!currentModel) {
    showToast("No model loaded yet");
    return;
  }

  wireframeOn = !wireframeOn;

  currentModel.traverse(function(child) {
    if (child.isMesh && child.material) {

      if (Array.isArray(child.material)) {
        child.material.forEach(function(mat) {
          mat.wireframe = wireframeOn;
          mat.needsUpdate = true;
        });
      } else {
        child.material.wireframe = wireframeOn;
        child.material.needsUpdate = true;
      }

    }
  });

  if (wireframeOn) {
    showToast("Wireframe on");
  } else {
    showToast("Wireframe off");
  }
}

function setupLightingGUI() {
  const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820, 3);
  scene.add(ambient);

  lights = {};

  lights.spot = new THREE.SpotLight(0xffffff, 2);
  lights.spot.visible = true;
  lights.spot.position.set(0, 8, 5);
  lights.spot.distance = 25;
  lights.spot.angle = Math.PI / 5;
  lights.spot.penumbra = 0.3;
  scene.add(lights.spot);

  lights.spotHelper = new THREE.SpotLightHelper(lights.spot);
  lights.spotHelper.visible = false;
  scene.add(lights.spotHelper);

  params = {
    spot: {
      enable: true,
      color: 0xffffff,
      intensity: 2,
      distance: 25,
      angle: Math.PI / 5,
      penumbra: 0.3,
      helper: false,
      moving: false
    }
  };

  const gui = new dat.GUI({ autoPlace: false });

  const guiContainer = document.getElementById("gui-container");
  guiContainer.appendChild(gui.domElement);

  const spotFolder = gui.addFolder("Spot Light");
  spotFolder.open();

  spotFolder.add(params.spot, "enable").onChange(function (value) {
    lights.spot.visible = value;
  });

  spotFolder.addColor(params.spot, "color").onChange(function (value) {
    lights.spot.color = new THREE.Color(value);
  });

  spotFolder.add(params.spot, "intensity", 0, 5).onChange(function (value) {
    lights.spot.intensity = value;
  });

  spotFolder.add(params.spot, "distance", 0, 50).onChange(function (value) {
    lights.spot.distance = value;
  });

  spotFolder.add(params.spot, "angle", 0.1, Math.PI / 2).onChange(function (value) {
    lights.spot.angle = value;
  });

  spotFolder.add(params.spot, "penumbra", 0, 1).onChange(function (value) {
    lights.spot.penumbra = value;
  });

  spotFolder.add(params.spot, "helper").onChange(function (value) {
    lights.spotHelper.visible = value;
  });

  spotFolder.add(params.spot, "moving");
}

function tintBmoFaceRed() {
  if (!currentModel) return;

  currentModel.traverse(function (child) {
    if (child.isMesh && child.material) {

      if (Array.isArray(child.material)) {
        child.material.forEach(function (mat) {
          if (mat.name === "Material.002" || mat.name === "material.002") {
            mat.color.set(0xff3333);
          }
        });
      } else {
        if (child.material.name === "Material.002" || child.material.name === "material.002") {
          child.material.color.set(0xff3333);
        }
      }

    }
  });
}

function loadPeppermintSpell() {
  loadModel("assets/models/peppermintbutlerwitch.glb", true);
  activatePurpleSpellLighting();
  createPurpleMist();
  showToast("Peppermint Butler casts a spell");
}

function activatePurpleSpellLighting() {
  if (!lights || !lights.spot) return;

  lights.spot.visible = true;
  lights.spot.color = new THREE.Color(0x7b00ff);
  lights.spot.intensity = 7;
  lights.spot.distance = 60;
  lights.spot.angle = Math.PI / 2.5;
  lights.spot.penumbra = 0.9;

  if (params && params.spot) {
    params.spot.enable = true;
    params.spot.color = 0x7b00ff;
    params.spot.intensity = 7;
    params.spot.distance = 60;
    params.spot.angle = Math.PI / 2.5;
    params.spot.penumbra = 0.9;
  }
}

function createPurpleMist() {
  if (!scene) return;

  const smokeGroup = new THREE.Group();
  scene.add(smokeGroup);

  const smokeTexture = createSmokeTexture();

  const smokeMaterial = new THREE.SpriteMaterial({
    map: smokeTexture,
    color: 0x8f00ff,
    transparent: true,
    opacity: 0.55,
    depthWrite: false
  });

  const smokeClouds = [];

  for (let i = 0; i < 45; i++) {
    const sprite = new THREE.Sprite(smokeMaterial.clone());

    sprite.position.set(
      (Math.random() - 0.5) * 4.5,
      Math.random() * 2.8 + 0.1,
      (Math.random() - 0.5) * 4.5
    );

    const scale = Math.random() * 1.8 + 1.0;
    sprite.scale.set(scale, scale, scale);

    sprite.material.opacity = Math.random() * 0.35 + 0.35;

    smokeGroup.add(sprite);
    smokeClouds.push(sprite);
  }

  let life = 1;

  const smokeAnimation = setInterval(function () {
    life -= 0.012;

    smokeClouds.forEach(function (sprite, index) {
      sprite.position.y += 0.018;
      sprite.position.x += Math.sin(Date.now() * 0.001 + index) * 0.004;
      sprite.position.z += Math.cos(Date.now() * 0.001 + index) * 0.004;

      sprite.scale.x += 0.018;
      sprite.scale.y += 0.018;

      sprite.material.opacity = Math.max(0, sprite.material.opacity - 0.006);
    });

    smokeGroup.rotation.y += 0.006;

    if (life <= 0) {
      clearInterval(smokeAnimation);

      smokeClouds.forEach(function (sprite) {
        sprite.material.dispose();
      });

      smokeTexture.dispose();
      scene.remove(smokeGroup);
    }
  }, 50);
}


function createSmokeTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");

  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    5,
    size / 2,
    size / 2,
    size / 2
  );

  gradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
  gradient.addColorStop(0.35, "rgba(255, 255, 255, 0.45)");
  gradient.addColorStop(0.7, "rgba(255, 255, 255, 0.16)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

function loadEnchiridionShake() {
  loadModel("assets/models/emchiredionshake.glb", true);
  showToast("The Enchiridion shakes");
}

function loadEnchiridionOpen() {
  loadModel("assets/models/emchiredionopen.glb", false);
  showToast("The gems begin to glow");

  setTimeout(function () {
    glowEnchiridionGems(function () {
      playAnimation();
      showToast("The Enchiridion opens");
    });
  }, 500);
}

function glowEnchiridionGems() {
  if (!currentModel) {
    console.warn("No model loaded for gem glow.");
    return;
  }

  const gemColorMap = {
    "material.047": 0x8cff8c, // light green
    "material.037": 0x9b4dff, // purple
    "material.043": 0x00ffff, // cyan
    "material.044": 0xff2222, // red
    "material.040": 0xffdd33, // yellow
    "material.035": 0x00ff44  // green
  };

  const gemMaterials = [];

  currentModel.traverse(function (child) {
    if (child.isMesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(function (mat) {
          collectColouredGem(mat, gemColorMap, gemMaterials);
        });
      } else {
        collectColouredGem(child.material, gemColorMap, gemMaterials);
      }
    }
  });

  console.log("Gem materials found:", gemMaterials.map(function (item) {
    return item.material.name;
  }));

  if (gemMaterials.length === 0) {
    console.warn("No gem materials found. Check material names.");
    return;
  }

  gemMaterials.forEach(function (item, index) {
    setTimeout(function () {
      glowSingleColouredGem(item.material, item.color);
    }, index * 450);
  });
}

function collectColouredGem(mat, gemColorMap, gemMaterials) {
  if (!mat || !mat.name) return;

  const name = mat.name.toLowerCase();

  if (gemColorMap[name]) {
    gemMaterials.push({
      material: mat,
      color: gemColorMap[name]
    });
  }
}

function glowSingleColouredGem(mat, colour) {
  if (!mat) return;

  if (!mat.userData.originalColor && mat.color) {
    mat.userData.originalColor = mat.color.clone();
  }

  if (mat.emissive && !mat.userData.originalEmissive) {
    mat.userData.originalEmissive = mat.emissive.clone();
    mat.userData.originalEmissiveIntensity = mat.emissiveIntensity || 0;
  }

  mat.color.set(colour);

  if (mat.emissive) {
    mat.emissive.set(colour);
    mat.emissiveIntensity = 12;
  }

  mat.needsUpdate = true;

  setTimeout(function () {
    if (mat.emissive) {
      mat.emissiveIntensity = 3.5;
      mat.needsUpdate = true;
    }
  }, 700);
}

function checkGemMaterial(mat, gemMaterialNames, gemMaterials) {
  if (!mat || !mat.name) return;

  const name = mat.name.toLowerCase();

  if (gemMaterialNames.includes(name)) {
    gemMaterials.push(mat);
  }
}

function glowSingleGem(mat) {
  if (!mat) return;

  mat.color.set(0xffdd55);

  if (mat.emissive) {
    mat.emissive.set(0xffaa00);
    mat.emissiveIntensity = 5;
  }

  mat.needsUpdate = true;

  setTimeout(function () {
    if (mat.userData.originalColor) {
      mat.color.copy(mat.userData.originalColor);
    }

    if (mat.emissive && mat.userData.originalEmissive) {
      mat.emissive.copy(mat.userData.originalEmissive);
      mat.emissiveIntensity = mat.userData.originalEmissiveIntensity;
    }

    mat.needsUpdate = true;
  }, 800);
}

function loadEnchiridionOpen() {
  loadModel("assets/models/emchiredionopen.glb", true);
  showToast("The Enchiridion opens");

  setTimeout(function () {
    glowEnchiridionGems();
  }, 2500);
}