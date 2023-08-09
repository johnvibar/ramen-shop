import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

let parent, scene, mesh = null, hologram, composer, camera, ktx2Loader, controls;

let videoTexture;

let shop, fan1 = null, fan2 = null, poleLight, vendingMachineScreen, bigScreen, arcadeScreen, renderer;

const clock = new THREE.Clock();

const meshes = [];

var creditFlag = 0;
var vendingFlag = 0;
var bigscreenFlag = 0;

init();

function init() {
    // create new scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.lookAt(scene.position);
    camera.position.set(-15, 5, -7);

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    parent = new THREE.Object3D();
    scene.add(parent);

    // ambient light
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // point light
    var pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    // orbitControl
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.x = 0;
    controls.target.y = 3;
    controls.target.z = 0;

    // controls.autoRotate = true;
    // controls.autoRotateSpeed = 1.5;
    controls.zoomSpeed = 1.5;
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.minDistance = 8;
    controls.maxDistance = 16;
    controls.maxPolarAngle = Math.PI / 1.85;
    controls.minPolarAngle = Math.PI / 6;

    controls.update();

    // postprocessing
    const renderScene = new RenderPass(scene, camera);

    // Configurable parameters: (resolution, strength, radius, threshold)
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.3, 0, 0.95);

    composer = new EffectComposer(renderer);
    
    const outputPass = new OutputPass( THREE.ReinhardToneMapping );
    // outputPass.toneMappingExposure = Math.pow( 1, 4.0 );

    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);


    const pass = new SMAAPass(window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio());
    composer.addPass(pass);

    // texture
    ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath('https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/basis/');
    ktx2Loader.detectSupport(renderer);

    // shop model
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/libs/draco/');
    dracoLoader.setDecoderConfig({ type: 'js' });

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    // load ramenShop model
    loader.load('assets/ramenShop.gltf', function (gltf) {

        shop = gltf.scene;

        // graphicsJoined
        const graphicsJoined = shop.getObjectByName("graphicsJoined", true);
        ktx2Loader.load('assets/texture/graphicsBaked512.ktx2', function (texture) {

            var material = new THREE.MeshStandardMaterial({ map: texture });
            graphicsJoined.traverse(texture => {
                if (texture.isMesh) {
                    texture.material = material;
                }
            })

        }, function () {
        }, function (e) {
            console.error(e);
        });

        // jesseZhouJoined
        const jesseZhouJoined = shop.getObjectByName("jesseZhouJoined", true);
        ktx2Loader.load('assets/texture/graphicsBaked512.ktx2', function (texture) {

            var material = new THREE.MeshStandardMaterial({ map: texture });
            jesseZhouJoined.traverse(texture => {
                if (texture.isMesh) {
                    texture.material = material;
                }
            })

        }, function () {
        }, function (e) {
            console.error(e);
        });

        // machinesJoined
        const machinesJoined = shop.getObjectByName("machinesJoined", true);
        ktx2Loader.load('assets/texture/machinesBaked1024.ktx2', function (texture) {

            var material = new THREE.MeshStandardMaterial({ map: texture });
            machinesJoined.traverse(texture => {
                if (texture.isMesh) {
                    texture.material = material;
                }
            })

        }, function () {
        }, function (e) {
            console.error(e);
        });

        // ramenShopJoined
        const ramenShopJoined = shop.getObjectByName("ramenShopJoined", true);
        ktx2Loader.load('assets/texture/ramenShopBaked1024.ktx2', function (texture) {

            var material = new THREE.MeshStandardMaterial({ map: texture });
            // var material = new THREE.MeshStandardMaterial( { map: texture } );
            ramenShopJoined.traverse(texture => {
                if (texture.isMesh) {
                    texture.material = material;
                }
            })

        }, function () {
        }, function (e) {
            console.error(e);
        });

        // miscJoined
        const miscJoined = shop.getObjectByName("miscJoined", true);
        ktx2Loader.load('assets/texture/miscBaked1024.ktx2', function (texture) {

            var material = new THREE.MeshStandardMaterial({ map: texture });
            miscJoined.traverse(texture => {
                if (texture.isMesh) {
                    texture.material = material;
                }
            })

        }, function () {
        }, function (e) {
            console.error(e);
        });

        // floor   

        const floor = shop.getObjectByName("floor", true);
        ktx2Loader.load('assets/texture/floorBaked1024.ktx2', function (texture) {

            // var material = new THREE.MeshStandardMaterial( { map: texture } );
            var material = new THREE.MeshStandardMaterial({ map: texture, transparent: true, opacity: 0.6, roughness: 0.7 });
            floor.traverse(texture => {
                if (texture.isMesh) {
                    texture.material = material;
                }
            })
            floor.layers.enable(0);

        }, function () {
        }, function (e) {
            console.error(e);
        });

        // reflector effect

        let geometry = new THREE.CircleGeometry(40, 64);
        let groundMirror = new Reflector(geometry, {
            clipBias: 0.003,
            textureWidth: window.innerWidth * window.devicePixelRatio,
            textureHeight: window.innerHeight * window.devicePixelRatio,
            color: 0xb5b5b5,
        });
        groundMirror.position.y = 0.1;
        groundMirror.reflectivity = 0.9;
        groundMirror.rotateX(- Math.PI / 2);
        scene.add(groundMirror);


        // easelFrontGraphic
        const easelFrontGraphic = shop.getObjectByName("easelFrontGraphic", true);
        ktx2Loader.load('assets/texture/easelClick.ktx2', function (texture) {

            var material = new THREE.MeshStandardMaterial({ map: texture });
            easelFrontGraphic.traverse(texture => {
                if (texture.isMesh) {
                    texture.material = material;
                }
            })

        }, function () {
        }, function (e) {
            console.error(e);
        });

        // vendingMachineScreen
        vendingMachineScreen = shop.getObjectByName("vendingMachineScreen", true);
        ktx2Loader.load('assets/texture/vendingMachineDefault.ktx2', function (texture) {

            var material = new THREE.MeshStandardMaterial({ map: texture });
            vendingMachineScreen.traverse(texture => {
                if (texture.isMesh) {
                    texture.material = material;
                }
            })

        }, function () {
        }, function (e) {
            console.error(e);
        });

        // arcadeScreen
        arcadeScreen = shop.getObjectByName("arcadeScreen", true);
        ktx2Loader.load('assets/texture/arcadeScreenDefault.ktx2', function (texture) {

            var material = new THREE.MeshStandardMaterial({ map: texture });
            arcadeScreen.traverse(texture => {
                if (texture.isMesh) {
                    texture.material = material;
                }
            })

        }, function () {
        }, function (e) {
            console.error(e);
        });

        // bigScreen
        bigScreen = shop.getObjectByName("bigScreen", true);
        ktx2Loader.load('assets/texture/bigScreenDefault.ktx2', function (texture) {

            var material = new THREE.MeshStandardMaterial({ map: texture });
            bigScreen.traverse(texture => {
                if (texture.isMesh) {
                    texture.material = material;
                }
            })

        }, function () {
        }, function (e) {
            console.error(e);
        });

        // dish
        const dish = shop.getObjectByName("dish", true);
        ktx2Loader.load('assets/texture/dishMatcap.ktx2', function (texture) {

            var material = new THREE.MeshPhongMaterial({ color: "#0E454C", shininess: 100 });
            dish.traverse(texture => {
                if (texture.isMesh) {
                    texture.material = material;
                }
            })

        }, function () {
        }, function (e) {
            console.error(e);
        });

        // dishStand
        const dishStand = shop.getObjectByName("dishStand", true);
        ktx2Loader.load('assets/texture/dishMatcap.ktx2', function (texture) {

            var material = new THREE.MeshStandardMaterial({ map: texture });
            dishStand.traverse(texture => {
                if (texture.isMesh) {
                    texture.material = material;
                }
            })

        }, function () {
        }, function (e) {
            console.error(e);
        });

        // fans
        fan1 = shop.getObjectByName("fan1", true);
        fan2 = shop.getObjectByName("fan2", true);
        ktx2Loader.load('assets/texture/fanMatcap.ktx2', function (texture) {

            var material = new THREE.MeshStandardMaterial({ map: texture });
            fan1.traverse(texture => {
                if (texture.isMesh) {
                    texture.material = material;
                }
            })
            fan2.traverse(texture => {
                if (texture.isMesh) {
                    texture.material = material;
                }
            })

        }, function () {
        }, function (e) {
            console.error(e);
        });


        // neonPink
        // var neonPinkMaterial = new THREE.MeshStandardMaterial({color: '#7E2B71', shininess: 100});
        var neonPinkMaterial = new THREE.MeshBasicMaterial({ color: '#FDFDFD' });
        neonPinkMaterial.userData.needsBloom = true;
        const neonPink = shop.getObjectByName("neonPink", true);
        neonPink.traverse(texture => {
            if (texture.isMesh) {
                texture.material = neonPinkMaterial;
            }
        })

        // neonBlue
        // var neonBlueMaterial = new THREE.MeshStandardMaterial({color: '#3CFFFF', shininess: 100});
        var neonBlueMaterial = new THREE.MeshBasicMaterial({ color: '#3CFFFF' });
        neonBlueMaterial.userData.needsBloom = true;
        const neonBlue = shop.getObjectByName("neonBlue", true);
        neonBlue.traverse(texture => {
            if (texture.isMesh) {
                texture.material = neonBlueMaterial;
            }
        })

        // neonGreen
        // var neonGreenMaterial = new THREE.MeshStandardMaterial({color: '#18FFFF', shininess: 100});
        var neonGreenMaterial = new THREE.MeshBasicMaterial({ color: '#18FFFF' });
        const neonGreen = shop.getObjectByName("neonGreen", true);
        neonGreen.traverse(texture => {
            if (texture.isMesh) {
                texture.material = neonGreenMaterial;
            }
        })

        // neonYellow
        const neonYellow = shop.getObjectByName("neonYellow", true);
        // var neonYellowMaterial = new THREE.MeshStandardMaterial({color: '#FFFAA3', shininess: 100});
        var neonYellowMaterial = new THREE.MeshBasicMaterial({ color: '#FFFAA3' });
        neonYellow.traverse(texture => {
            if (texture.isMesh) {
                texture.material = neonYellowMaterial;
            }
        })

        // arcadeRim
        // var neonMaterial = new THREE.MeshPhongMaterial({color: '#FFFAA3', shininess: 100});
        var neonMaterial = new THREE.MeshStandardMaterial({ color: '#94FFFF' });
        const arcadeRim = shop.getObjectByName("arcadeRim", true);
        arcadeRim.traverse(texture => {
            if (texture.isMesh) {
                texture.material = neonMaterial;
            }
        })

        // chinese
        const chinese = shop.getObjectByName("chinese", true);
        // var chineseMaterial = new THREE.MeshStandardMaterial({color: '#3bf79c'});
        var chineseMaterial = new THREE.MeshBasicMaterial({ color: '#57FF90' });
        chinese.traverse(texture => {
            if (texture.isMesh) {
                texture.material = chineseMaterial;
            }
        })

        // poleLight

        poleLight = shop.getObjectByName("poleLight", true);

        const poleLightMaterial = new THREE.MeshBasicMaterial({ color: '#fff' });

        poleLight.traverse(texture => {
            if (texture.isMesh) {
                texture.material = poleLightMaterial.clone();
                texture.material.emissiveIntensity = 1.0;
            }
        })

        // blueLights
        const blueLights = shop.getObjectByName("blueLights", true);
        var chineseMaterial = new THREE.MeshBasicMaterial({ color: '#40d1f5' });
        blueLights.traverse(texture => {
            if (texture.isMesh) {
                texture.material = chineseMaterial;
            }
        })

        // redLED
        const redLED = shop.getObjectByName("redLED", true);
        var chineseMaterial = new THREE.MeshBasicMaterial({ color: '#FF4268' });
        redLED.traverse(texture => {
            if (texture.isMesh) {
                texture.material = chineseMaterial;
            }
        })

        // greenLED
        const greenLED = shop.getObjectByName("greenLED", true);
        var chineseMaterial = new THREE.MeshBasicMaterial({ color: '#00FF00' });
        greenLED.traverse(texture => {
            if (texture.isMesh) {
                texture.material = chineseMaterial;
            }
        })

        // whiteButton
        const whiteButton = shop.getObjectByName("whiteButton", true);
        var chineseMaterial = new THREE.MeshBasicMaterial({ color: '#fff' });
        whiteButton.traverse(texture => {
            if (texture.isMesh) {
                texture.material = chineseMaterial;
            }
        })

        // yellowRightLight
        const yellowRightLight = shop.getObjectByName("yellowRightLight", true);
        var chineseMaterial = new THREE.MeshBasicMaterial({ color: '#FF9000' });
        yellowRightLight.traverse(texture => {
            if (texture.isMesh) {
                texture.material = chineseMaterial;
            }
        })

        // greenSignSquare
        const greenSignSquare = shop.getObjectByName("greenSignSquare", true);
        var chineseMaterial = new THREE.MeshBasicMaterial({ color: '#57FF90' });
        greenSignSquare.traverse(texture => {
            if (texture.isMesh) {
                texture.material = chineseMaterial;
            }
        })

        // creditsOrange
        const creditsOrange = shop.getObjectByName("creditsOrange", true);
        var chineseMaterial = new THREE.MeshBasicMaterial({ color: '#FF9000' });
        creditsOrange.traverse(texture => {
            if (texture.isMesh) {
                texture.material = chineseMaterial;
            }
        })

        // jZhouPink
        const jZhouPink = shop.getObjectByName("jZhouPink", true);
        var chineseMaterial = new THREE.MeshBasicMaterial({ color: '#FF6DE9' });
        jZhouPink.traverse(texture => {
            if (texture.isMesh) {
                texture.material = chineseMaterial;
            }
        })

        // projectsRed
        const projectsRed = shop.getObjectByName("projectsRed", true);
        var chineseMaterial = new THREE.MeshBasicMaterial({ color: '#FF0071' });
        projectsRed.traverse(texture => {
            if (texture.isMesh) {
                texture.material = chineseMaterial;
            }
        })

        // projectsWhite
        const projectsWhite = shop.getObjectByName("projectsWhite", true);
        var chineseMaterial = new THREE.MeshBasicMaterial({ color: '#fff' });
        projectsWhite.traverse(texture => {
            if (texture.isMesh) {
                texture.material = chineseMaterial;
            }
        })

        // articlesRed
        const articlesRed = shop.getObjectByName("articlesRed", true);
        var chineseMaterial = new THREE.MeshBasicMaterial({ color: '#FF0071' });
        articlesRed.traverse(texture => {
            if (texture.isMesh) {
                texture.material = chineseMaterial;
            }
        })

        // articlesWhite
        const articlesWhite = shop.getObjectByName("articlesWhite", true);
        var chineseMaterial = new THREE.MeshBasicMaterial({ color: '#fff' });
        articlesWhite.traverse(texture => {
            if (texture.isMesh) {
                texture.material = chineseMaterial;
            }
        })

        // aboutMeBlue
        const aboutMeBlue = shop.getObjectByName("aboutMeBlue", true);
        var chineseMaterial = new THREE.MeshBasicMaterial({ color: '#10EDFF' });
        aboutMeBlue.traverse(texture => {
            if (texture.isMesh) {
                texture.material = chineseMaterial;
            }
        })

        // storageLight
        const storageLight = shop.getObjectByName("storageLight", true);
        var storageMaterial = new THREE.MeshBasicMaterial({ color: '#00DAFF' });
        storageLight.traverse(texture => {
            if (texture.isMesh) {
                texture.material = storageMaterial;
            }
        })

        // portalLight
        const portalLight = shop.getObjectByName("portalLight", true);
        var chineseMaterial = new THREE.MeshBasicMaterial({ color: '#00DAFF' });
        portalLight.traverse(texture => {
            if (texture.isMesh) {
                texture.material = storageMaterial;
            }
        })

        const video = document.getElementById('video');
        video.playsinline = true;
        video.loop = true;

        videoTexture = new THREE.VideoTexture(video);
        video.play();
        const material = new THREE.MeshStandardMaterial({ map: videoTexture });

        // tvScreen
        const tvScreen = shop.getObjectByName("tvScreen", true);
        tvScreen.traverse(texture => {
            if (texture.isMesh) {
                texture.material = material;
            }
        });

        // littleTVScreen
        const littleTVScreen = shop.getObjectByName("littleTVScreen", true);
        littleTVScreen.traverse(texture => {
            if (texture.isMesh) {
                texture.material = material;
            }
        });

        // tallScreen
        const tallScreen = shop.getObjectByName("tallScreen", true);
        tallScreen.traverse(texture => {
            if (texture.isMesh) {
                texture.material = material;
            }
        });

        // sideScreen
        const sideScreen = shop.getObjectByName("sideScreen", true);
        sideScreen.traverse(texture => {
            if (texture.isMesh) {
                texture.material = material;
            }
        });

        // smallScreen5
        const smallScreen5 = shop.getObjectByName("smallScreen5", true);
        smallScreen5.traverse(texture => {
            if (texture.isMesh) {
                texture.material = material;
            }
        });

        // smallScreen4
        const smallScreen4 = shop.getObjectByName("smallScreen4", true);
        smallScreen4.traverse(texture => {
            if (texture.isMesh) {
                texture.material = material;
            }
        });

        // smallScreen3
        const smallScreen3 = shop.getObjectByName("smallScreen3", true);
        smallScreen3.traverse(texture => {
            if (texture.isMesh) {
                texture.material = material;
            }
        });

        // smallScreen2
        const smallScreen2 = shop.getObjectByName("smallScreen2", true);
        smallScreen2.traverse(texture => {
            if (texture.isMesh) {
                texture.material = material;
            }
        });

        // smallScreen1
        const smallScreen1 = shop.getObjectByName("smallScreen1", true);
        smallScreen1.traverse(texture => {
            if (texture.isMesh) {
                texture.material = material;
            }
        });

        scene.add(gltf.scene);

    }, undefined, function (error) {
        console.error(error);
    });

    parent = new THREE.Object3D();
    scene.add(parent);

    // ramenHologram model    
    loader.load('assets/ramenHologram.gltf', function (gltf) {

        hologram = gltf.scene;

        const positions = combineBuffer(hologram, 'position');
        createMesh(positions, scene, 0.023, 0, 5, -1, 0xff7744);

    }, undefined, function (error) {
        console.error(error);
    });
    animate();
}

// resize canvas on resize window
window.addEventListener('resize', () => {
    let width = window.innerWidth;
    let height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    composer.setSize(width, height);
})

// onclick event
window.addEventListener('pointerdown', clickEvent);
window.addEventListener('touchend', clickEvent);

function clickEvent(e) {
    // onclick event
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        // Loop through the intersects array to find the object(s) you want to handle
        for (var i = 0; i < 2; i++) {
            var intersectedObject = intersects[i].object;
            
            if ((intersectedObject.name === 'projectsWhite' || intersectedObject.name === 'projectsRed') || (intersectedObject.name === 'vendingMachineScreen' && vendingFlag == 0) || (intersectedObject.name === 'back1' && vendingFlag == 2)){
                new TWEEN.Tween(camera.position)
                    .to(
                        {
                            x: 1,
                            y: 0,
                            z: 10,
                        },
                        2000
                    )
                    .easing(TWEEN.Easing.Cubic.Out)
                    .onUpdate(function () {
                        controls.update();
                    })
                    .start()
                    ;
                new TWEEN.Tween(controls.target)
                    .to(
                        {
                            x: 1.2,
                            y: 2.2,
                            z: 0,
                        },
                        2000
                    )
                    .easing(TWEEN.Easing.Cubic.Out)
                    .onUpdate(function () {
                        controls.enabled = false;
                        controls.update();
                    })
                    .start()
                    ;
                new TWEEN.Tween(controls)
                    .to(
                        {
                            maxDistance: 4.5,
                            // minDistance: 4
                        },
                        2000
                    )
                    .easing(TWEEN.Easing.Cubic.Out)
                    .onUpdate(function () {
                        controls.update();
                    })
                    .onStart(function () {
                        controls.minDistance = 0;
                    })
                    .start()
                    ;
                vendingFlag = 1;
                ktx2Loader.load('assets/texture/vendingMachineMenu.ktx2', function (texture) {

                    var material = new THREE.MeshStandardMaterial({ map: texture });
                    vendingMachineScreen.traverse(texture => {
                        if (texture.isMesh) {
                            texture.material = material;
                        }
                    })

                }, function () {
                }, function (e) {
                    console.error(e);
                });
                return;

            } else if (intersectedObject.name === 'project1' && vendingFlag == 1) {
                vendingFlag = 2;
                ktx2Loader.load('assets/texture/project1.ktx2', function (texture) {

                    var material = new THREE.MeshStandardMaterial({ map: texture });
                    vendingMachineScreen.traverse(texture => {
                        if (texture.isMesh) {
                            texture.material = material;
                        }
                    })

                }, function () {
                }, function (e) {
                    console.error(e);
                });
                return;
            } else if (intersectedObject.name === 'project2' && vendingFlag == 1) {
                vendingFlag = 2;
                ktx2Loader.load('assets/texture/project2.ktx2', function (texture) {

                    var material = new THREE.MeshStandardMaterial({ map: texture });
                    vendingMachineScreen.traverse(texture => {
                        if (texture.isMesh) {
                            texture.material = material;
                        }
                    })

                }, function () {
                }, function (e) {
                    console.error(e);
                });
                return;
            } else if (intersectedObject.name === 'project3' && vendingFlag == 1) {
                vendingFlag = 2;
                ktx2Loader.load('assets/texture/project3.ktx2', function (texture) {

                    var material = new THREE.MeshStandardMaterial({ map: texture });
                    vendingMachineScreen.traverse(texture => {
                        if (texture.isMesh) {
                            texture.material = material;
                        }
                    })

                }, function () {
                }, function (e) {
                    console.error(e);
                });
                return;
            } else if (intersectedObject.name === 'project4' && vendingFlag == 1) {
                vendingFlag = 2;
                ktx2Loader.load('assets/texture/project4.ktx2', function (texture) {

                    var material = new THREE.MeshStandardMaterial({ map: texture });
                    vendingMachineScreen.traverse(texture => {
                        if (texture.isMesh) {
                            texture.material = material;
                        }
                    })

                }, function () {
                }, function (e) {
                    console.error(e);
                });
                return;
            } else if (intersectedObject.name === 'project5' && vendingFlag == 1) {
                vendingFlag = 2;
                ktx2Loader.load('assets/texture/project5.ktx2', function (texture) {

                    var material = new THREE.MeshStandardMaterial({ map: texture });
                    vendingMachineScreen.traverse(texture => {
                        if (texture.isMesh) {
                            texture.material = material;
                        }
                    })

                }, function () {
                }, function (e) {
                    console.error(e);
                });
                return;
            } else if (intersectedObject.name === 'project6' && vendingFlag == 1) {
                vendingFlag = 2;
                ktx2Loader.load('assets/texture/project6.ktx2', function (texture) {

                    var material = new THREE.MeshStandardMaterial({ map: texture });
                    vendingMachineScreen.traverse(texture => {
                        if (texture.isMesh) {
                            texture.material = material;
                        }
                    })

                }, function () {
                }, function (e) {
                    console.error(e);
                });
                return;
            } else if (intersectedObject.name === 'project7' && vendingFlag == 1) {
                vendingFlag = 2;
                ktx2Loader.load('assets/texture/project7.ktx2', function (texture) {

                    var material = new THREE.MeshStandardMaterial({ map: texture });
                    vendingMachineScreen.traverse(texture => {
                        if (texture.isMesh) {
                            texture.material = material;
                        }
                    })

                }, function () {
                }, function (e) {
                    console.error(e);
                });
                return;
            } else if (intersectedObject.name === 'project8' && vendingFlag == 1) {
                vendingFlag = 2;
                ktx2Loader.load('assets/texture/project8.ktx2', function (texture) {

                    var material = new THREE.MeshStandardMaterial({ map: texture });
                    vendingMachineScreen.traverse(texture => {
                        if (texture.isMesh) {
                            texture.material = material;
                        }
                    })

                }, function () {
                }, function (e) {
                    console.error(e);
                });
                return;
            } else if (intersectedObject.name === 'aboutMeBlack' || intersectedObject.name === 'aboutMeBlue' || intersectedObject.name === 'about' || (intersectedObject.name === 'bigScreen' && bigscreenFlag == 0)) {
                bigscreenFlag = 1;
                ktx2Loader.load('assets/texture/bigScreenAbout.ktx2', function (texture) {

                    var material = new THREE.MeshStandardMaterial({ map: texture });
                    bigScreen.traverse(texture => {
                        if (texture.isMesh) {
                            texture.material = material;
                        }
                    })

                }, function () {
                }, function (e) {
                    console.error(e);
                });

                new TWEEN.Tween(camera.position)
                    .to(
                        {
                            x: 0,
                            y: 0,
                            z: 10,
                        },
                        3000
                    )
                    .easing(TWEEN.Easing.Cubic.Out)
                    .onUpdate(function () {
                        controls.update();
                    })
                    .start()
                    ;
                new TWEEN.Tween(controls.target)
                    .to(
                        {
                            x: 0,
                            y: 7,
                            z: 0,
                        },
                        3000
                    )
                    .easing(TWEEN.Easing.Cubic.Out)
                    .onUpdate(function () {
                        controls.update();
                    })
                    .start()
                    ;
                new TWEEN.Tween(controls)
                    .to(
                        {
                            maxDistance: 3,
                            // minDistance: 2.3
                        },
                        2000
                    )
                    .easing(TWEEN.Easing.Cubic.Out)
                    .onUpdate(function () {
                        controls.enabled = false;
                        controls.update();
                    })
                    .onStart(function () {
                        controls.minDistance = 0;
                    })
                    .start()
                    ;
                    return;

            } else if ((intersectedObject.name === 'creditsBlack' || intersectedObject.name === 'creditsOrange') || (intersectedObject.name === 'arcadeScreen' && creditFlag == 0)) {
                creditFlag = 1;
                new TWEEN.Tween(camera.position)
                    .to(
                        {
                            x: -0.5,
                            y: 0,
                            z: 5,
                        },
                        3000
                    )
                    .easing(TWEEN.Easing.Cubic.Out)
                    .onUpdate(function () {
                        controls.update();
                    })
                    .start()
                    ;
                new TWEEN.Tween(controls.target)
                    .to(
                        {
                            x: -0.8,
                            y: 2.3,
                            z: 0,
                        },
                        2000
                    )
                    .easing(TWEEN.Easing.Cubic.Out)
                    .onUpdate(function () {
                        controls.enabled = false;
                        controls.update();
                    })
                    .start()
                    ;
                new TWEEN.Tween(controls)
                    .to(
                        {
                            maxDistance: 3.5,
                            // minDistance: 4
                        },
                        2000
                    )
                    .easing(TWEEN.Easing.Cubic.Out)
                    .onUpdate(function () {
                        controls.update();
                    })
                    .onStart(function () {
                        controls.minDistance = 0;
                    })
                    .start()
                    ;
                    return;
                
            } else if (intersectedObject.name === 'arcadeScreen' && creditFlag == 1) {
                creditFlag = 2;
                ktx2Loader.load('assets/texture/arcadeScreenCredits.ktx2', function (texture) {

                    var material = new THREE.MeshStandardMaterial({ map: texture });
                    arcadeScreen.traverse(texture => {
                        if (texture.isMesh) {
                            texture.material = material;
                        }
                    })

                }, function () {
                }, function (e) {
                    console.error(e);
                });   
                return;             
                    
            } else if (intersectedObject.name === 'arcadeScreen' && creditFlag == 2) {
                creditFlag = 3;
                ktx2Loader.load('assets/texture/arcadeScreenThanks.ktx2', function (texture) {

                    var material = new THREE.MeshStandardMaterial({ map: texture });
                    arcadeScreen.traverse(texture => {
                        if (texture.isMesh) {
                            texture.material = material;
                        }
                    })

                }, function () {
                }, function (e) {
                    console.error(e);
                });
                return;
                
            } else if (intersectedObject.name === 'experience') {
                ktx2Loader.load('assets/texture/bigScreenExperience.ktx2', function (texture) {

                    var material = new THREE.MeshStandardMaterial({ map: texture });
                    bigScreen.traverse(texture => {
                        if (texture.isMesh) {
                            texture.material = material;
                        }
                    })

                }, function () {
                }, function (e) {
                    console.error(e);
                });
                return;
            } else if (intersectedObject.name === 'skill') {
                ktx2Loader.load('assets/texture/bigScreenSkills.ktx2', function (texture) {

                    var material = new THREE.MeshStandardMaterial({ map: texture });
                    bigScreen.traverse(texture => {
                        if (texture.isMesh) {
                            texture.material = material;
                        }
                    })

                }, function () {
                }, function (e) {
                    console.error(e);
                });
                return;
            } else if ((intersectedObject.name === 'back1' && vendingFlag == 1) || intersectedObject.name === 'back' || (intersectedObject.name === 'arcadeScreen' && creditFlag == 3)) {
                
                new TWEEN.Tween(camera.position)
                    .to(
                        {
                            x: -15,
                            y: 5,
                            z: -7,
                        },
                        3000
                    )
                    .easing(TWEEN.Easing.Cubic.Out)
                    .onUpdate(function () {
                        controls.update();
                    })
                    .start()
                    ;
                new TWEEN.Tween(controls.target)
                    .to(
                        {
                            x: 0,
                            y: 3,
                            z: 0,
                        },
                        3000
                    )
                    .easing(TWEEN.Easing.Cubic.Out)
                    .onUpdate(function () {
                        controls.update();
                    })
                    .start()
                    ;
                new TWEEN.Tween(controls)
                    .to(
                        {
                            minDistance: 8,
                            maxDistance: 16
                        },
                        3000
                    )
                    .easing(TWEEN.Easing.Cubic.Out)
                    .onUpdate(function () {
                        controls.update();
                        controls.enabled = true;
                    })
                    .start()
                    ;
                ktx2Loader.load('assets/texture/vendingMachineDefault.ktx2', function (texture) {

                    var material = new THREE.MeshStandardMaterial({ map: texture });
                    vendingMachineScreen.traverse(texture => {
                        if (texture.isMesh) {
                            texture.material = material;
                        }
                    })

                }, function () {
                }, function (e) {
                    console.error(e);
                });
                ktx2Loader.load('assets/texture/arcadeScreenDefault.ktx2', function (texture) {

                    var material = new THREE.MeshStandardMaterial({ map: texture });
                    arcadeScreen.traverse(texture => {
                        if (texture.isMesh) {
                            texture.material = material;
                        }
                    })

                }, function () {
                }, function (e) {
                    console.error(e);
                });
                ktx2Loader.load('assets/texture/bigScreenDefault.ktx2', function (texture) {

                    var material = new THREE.MeshStandardMaterial({ map: texture });
                    bigScreen.traverse(texture => {
                        if (texture.isMesh) {
                            texture.material = material;
                        }
                    })

                }, function () {
                }, function (e) {
                    console.error(e);
                });
                vendingFlag = 0;
                creditFlag = 0;
                bigscreenFlag = 0;
            }
        }
    }

}

function animate() {
    requestAnimationFrame(animate);
    const halfWidth = window.innerWidth / 2;
    composer.render();
    TWEEN.update();
    render();
}

function combineBuffer(model, bufferName) {

    let count = 0;

    model.traverse(function (child) {

        if (child.isMesh) {

            const buffer = child.geometry.attributes[bufferName];

            count += buffer.array.length;

        }

    });

    const combined = new Float32Array(count);

    let offset = 0;

    model.traverse(function (child) {

        if (child.isMesh) {

            const buffer = child.geometry.attributes[bufferName];

            combined.set(buffer.array, offset);
            offset += buffer.array.length;

        }

    });

    return new THREE.BufferAttribute(combined, 3);

}

function createMesh(positions, scene, scale, x, y, z, color) {

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', positions.clone());
    geometry.setAttribute('initialPosition', positions.clone());

    geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);

    const clones = [0, 0, 0];

    mesh = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.03, color: "#00F0F0" }));
    mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;

    mesh.position.x = x + clones[0];
    mesh.position.y = y + clones[1];
    mesh.position.z = z + clones[2];

    parent.add(mesh);

    meshes.push({
        mesh: mesh, verticesDown: 0, verticesUp: 0, direction: 0, speed: 15, delay: Math.floor(200 + 200 * Math.random()),
        start: Math.floor(100 + 200 * Math.random()),
    });

}

// particle cup
function render() {

    let delta = 10 * clock.getDelta();

    delta = delta < 2 ? delta : 2;

    // object.rotation.y += - 0.02 * delta;
    if (mesh !== null)
        mesh.rotation.y += - 0.02 * delta;

    // const fan1 = shop.getObjectByName("fan1", true);
    if (fan1 !== null)
        fan1.rotation.y += - 0.2 * delta;
    if (fan2 !== null)
        fan2.rotation.y += - 0.2 * delta;

    for (let j = 0; j < meshes.length; j++) {

        const data = meshes[j];
        const positions = data.mesh.geometry.attributes.position;
        const initialPositions = data.mesh.geometry.attributes.initialPosition;

        const count = positions.count;

        if (data.start > 0) {

            data.start -= 1;

        } else {

            if (data.direction === 0) {

                data.direction = - 1;

            }

        }

        for (let i = 0; i < count; i++) {

            const px = positions.getX(i);
            const py = positions.getY(i);
            const pz = positions.getZ(i);

            // falling down
            if (data.direction < 0) {

                if (py > 0) {

                    positions.setXYZ(
                        i,
                        px + 1.5 * (0.50 - Math.random()) * data.speed * delta,
                        py + 3.0 * (0.25 - Math.random()) * data.speed * delta,
                        pz + 1.5 * (0.50 - Math.random()) * data.speed * delta
                    );

                } else {

                    data.verticesDown += 1;

                }

            }

            // rising up
            if (data.direction > 0) {

                const ix = initialPositions.getX(i);
                const iy = initialPositions.getY(i);
                const iz = initialPositions.getZ(i);

                const dx = Math.abs(px - ix);
                const dy = Math.abs(py - iy);
                const dz = Math.abs(pz - iz);

                const d = dx + dy + dx;

                if (d > 1) {

                    positions.setXYZ(
                        i,
                        px - (px - ix) / dx * data.speed * delta * (0.85 - Math.random()),
                        py - (py - iy) / dy * data.speed * delta * (1 + Math.random()),
                        pz - (pz - iz) / dz * data.speed * delta * (0.85 - Math.random())
                    );

                } else {

                    data.verticesUp += 1;

                }

            }

        }

        // all vertices down
        if (data.verticesDown >= count) {

            if (data.delay <= 0) {

                data.direction = 1;
                data.speed = 5;
                data.verticesDown = 0;
                data.delay = 320;

            } else {

                data.delay -= 1;

            }

        }

        // all vertices up
        if (data.verticesUp >= count) {

            if (data.delay <= 0) {

                data.direction = - 1;
                data.speed = 15;
                data.verticesUp = 0;
                data.delay = 120;

            } else {

                data.delay -= 1;

            }

        }

        positions.needsUpdate = true;

    }

}