/* little_adventure.mjs — renderer bootstrap, camera, input wiring, audio/speech glue, loop, save I/O */

'use strict';

let booted = false;

window.startlittle_adventure = function startlittle_adventure(){
    if (booted) return;
    booted = true;

    try {
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio( Math.min( window.devicePixelRatio, 1.5 ) );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.getElementById('i3d-view').appendChild( renderer.domElement );

        // Scene: sky + fog, directional + hemisphere light, ground + water
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog( 0x87CEEB, 60, 120 );

        const hemi = new THREE.HemisphereLight( 0xFFFFFF, 0x4488FF, 0.9 );
        scene.add( hemi );

        const dir = new THREE.DirectionalLight( 0xFFFFFF, 0.8 );
        dir.position.set( 5, 10, 7.5 );
        scene.add( dir );

        // Ground: subdivided plane with per-vertex colours by zone
        const groundGeo = new THREE.PlaneGeometry( 128, 128, 64, 64 );
        const groundCol = new THREE.Color( 0x87CEEB );
        for ( let i = 0; i < groundGeo.attributes.position.count; i++ ) {
            const h = groundGeo.attributes.position.getY( i ).toNumber() / 64;
            groundGeo.attributes.position.setXYZ( i, h * 16, h * -64, groundGeo.attributes.position.getZ( i ) );
        }
        const groundMat = new THREE.MeshLambertMaterial({ flatShading: true, color: 0x87CEEB });
        const ground = new THREE.Mesh( groundGeo, groundMat );
        ground.rotation.x = - Math.PI / 2;
        scene.add( ground );

        // Water plane slightly below ground
        const water = new THREE.Mesh(
            new THREE.PlaneGeometry( 128, 128 ),
            new THREE.MeshLambertMaterial({ flatShading: true, color: 0x6EC6E8, transparent: true, opacity: 0.6 })
        );
        water.rotation.x = - Math.PI / 2 - 0.01;
        scene.add( water );

        // Placeholder box that follows hero state (created later)
        const box = new THREE.Mesh(
            new THREE.BoxGeometry( 2, 2, 2 ),
            new THREE.MeshLambertMaterial({ flatShading: true, color: 0xFFD23F })
        );
        scene.add( box );

        // Camera: fixed pitch/yaw following hero
        const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
        camera.position.set( 0, 13, 11 );
        camera.lookAt( 0, 0.6, 0 );

        // Fixed camera offset that follows hero
        const followRate = 6;
        function followCamera(){
            // heroPos is set by createGame later; this is a stub
        }

        // Render loop
        let dtAccum = 0;
        const subStep = 20;
        const dtClamp = 100;

        function render(){
            requestAnimationFrame( render );
            dtAccum += 16;
            while ( dtAccum >= subStep ) {
                dtAccum -= subStep;
                // TODO: game.step( subStep, input );
            }
            renderer.render( scene, camera );
        }
        render();

        // Context loss handling
        renderer.domElement.addEventListener( 'webglcontextlost', (e)=>{
            e.preventDefault();
            // freeze sim, show nothing broken
            console.log( 'WebGL context lost' );
        }, false );
        renderer.domElement.addEventListener( 'webglcontextrestored', ()=>{
            // rebuild GPU resources and resume
        }, false );

        // Back button: stop loop, dispose renderer/geometries/materials
        document.getElementById( 'i3d-back' ).addEventListener( 'click', ()=>{
            cancelAnimationFrame( render );
            // dispose would go here; stub for IS-01
        } );

    } catch (e){
        // No WebGL → fallback text inside #i3d-view
        document.getElementById('i3d-view').innerHTML = '3D није доступан овде';
    }
};