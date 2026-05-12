let scene, camera, renderer, controls;
let mixer, clock;
let currentModel;
let actions = [];

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

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(pageConfig.background, function (texture) {
    scene.background = texture;
  });

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
    antialias: true
  });

  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(5, 10, 5);
  scene.add(directionalLight);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.update();

  loadModel(pageConfig.startModel);

  window.addEventListener("resize", onResize);
}

function loadModel(fileName) {
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


      if (actions.length > 0) {
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
  renderer.render(scene, camera);
}

function onResize() {
  const canvas = document.getElementById("threeCanvas");

  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}