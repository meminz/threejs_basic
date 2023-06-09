// TRASFORMAZIONI
function matriceTraslazione( dx, dy, dz ){
	var M = new THREE.Matrix4();

	M.set(
		1, 0, 0, dx,
		0, 1, 0, dy,
		0, 0, 1, dz,
		0, 0, 0, 1,
	);

	return M;
}

function matriceRotazioneX( deg ){
	var M = new THREE.Matrix4();

	var rad = deg * Math.PI / 180;
	var s = Math.sin(rad);
	var c = Math.cos(rad)

	M.set(
	    1, 0, 0, 0,
	    0, c,-s, 0,
	    0, s, c, 0,
	    0, 0, 0, 1
	);

	return M;
}

function matriceRotazioneY( deg ){
	var M = new THREE.Matrix4();

	var rad = deg * Math.PI / 180;
	var s = Math.sin(rad);
	var c = Math.cos(rad)

	M.set(
	    c, 0, s, 0,
	    0, 1, 0, 0,
	   -s, 0, c, 0,
	    0, 0, 0, 1
	);

	return M;
}

function matriceRotazioneZ( deg ){
	var M = new THREE.Matrix4();

	var rad = deg * Math.PI / 180;
	var s = Math.sin(rad);
	var c = Math.cos(rad)

	M.set(
	    s, c, 0, 0,
	    c,-s, 0, 0,
	    0, 0, 1, 0,
	    0, 0, 0, 1
	);

	return M;
}

function matriceScalatura(sx, sy, sz){
	var M = new THREE.Matrix4();

	M.set(
	    sx, 0, 0, 0,
	     0,sy, 0, 0,
	     0, 0,sz, 0,
	     0, 0, 0, 1
	);

	return M;	
}


// actual shit
var mioCanvas = document.getElementById( "mioCanvas" )

var rasterizzatore = new THREE.WebGLRenderer({canvas: mioCanvas});
rasterizzatore.setClearColor(0x87ceeb);
rasterizzatore.clear();


rasterizzatore.shadowMap.enabled = true;
rasterizzatore.shadowMap.type = THREE.PCFSoftShadowMap;

var scena = new THREE.Scene();


// LIGHTING
var luce = new THREE.DirectionalLight( 0xffffff, 1);
luce.position.set(7, 10, 0);
luce.castShadow = true;
scena.add(luce);

// var helper = new THREE.CameraHelper(luce.shadow.camera);
// scena.add(helper);
var luceAmbientale = new THREE.AmbientLight( 0x555555 );
scena.add(luceAmbientale);


// MATERIALI
var materialeElicottero = new THREE.MeshLambertMaterial();
materialeElicottero.color = new THREE.Color(0xFFFFFF);
//texture
var tessitura = new THREE.TextureLoader().load("unimiLogo.jpg");


var materialeElica = new THREE.MeshLambertMaterial();
materialeElica.color = new THREE.Color(0x16161d);
// materialeArancione.wireframe = true;
// materialeArancione.depthTest = false;


// MESHES
var miaMeshElicottero = new THREE.Mesh(new THREE.BoxGeometry(), materialeElicottero);
var miaMeshElica = new THREE.Mesh(new THREE.BoxGeometry(), materialeElica);


miaMeshElicottero.castShadow = true;
miaMeshElica.castShadow = true;
miaMeshElicottero.receiveShadow = true;
miaMeshElica.receiveShadow = true;

miaMeshElicottero.roughness = 0.0;
miaMeshElica.roughness = 0.0;

miaMeshElicottero.material.map = tessitura;

// PIANO BASE
var pianoTerra = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 32, 32 ), new THREE.MeshStandardMaterial( {color: 0xcabb99, side: THREE.DoubleSide} ) );
pianoTerra.matrix = matriceRotazioneX(-90);
pianoTerra.matrix.multiply(matriceTraslazione(0,0,-0.51));
pianoTerra.receiveShadow = true;


scena.add(miaMeshElicottero);
scena.add(miaMeshElica);
scena.add(pianoTerra);

scena.fog = new THREE.Fog( 0x87ceeb, 10, 20 );


miaMeshElicottero.matrixAutoUpdate = false;
miaMeshElica.matrixAutoUpdate = false;
pianoTerra.matrixAutoUpdate = false;

miaMeshElicottero.add(miaMeshElica);


// CAMERA
var miaCamera =
new THREE.PerspectiveCamera( // telecamera prospettica, parametri intrinseci nel costruttore
	60,		// FOV (dunno verticale o orizzontale)
	4/3,	// aspect ratio
	0.01,	// zNear
	100		// zFar
	);


// TRACKBALL
var trackball = {
	phi: 	40,
	theta: 	-45,
	dist: 	10,

	matriceDiVista: function(){
		var M =     matriceTraslazione(0,0, -this.dist);
		M.multiply( matriceRotazioneX(   -this.theta));
		M.multiply( matriceRotazioneY(   -this.phi));
		return M;
	},

	limitaAngoli: function(){
		if (this.theta < -90) this.theta = -90;
		if (this.theta >  90) this.theta =  90;
	}
}

miaCamera.matrixWorldAutoUpdate = false;
miaCamera.matrixWorldInverse = trackball.matriceDiVista();


rasterizzatore.render(scena, miaCamera);


// event handler
// call-back function
function callbackMovimentoMouse( e ){
	if(e.buttons != 0){
		trackball.phi 	-= e.movementX / 2;		// 1 grado di rotazione ogni 4 pixel di spostamento
		trackball.theta -= e.movementY / 2;
		trackball.limitaAngoli();
		miaCamera.matrixWorldInverse = trackball.matriceDiVista();
		rasterizzatore.render(scena, miaCamera);
	}
}

function callbackMovimentoRotella( e ){
	trackball.dist += e.deltaY / 400
	miaCamera.matrixWorldInverse = trackball.matriceDiVista();
	rasterizzatore.render(scena, miaCamera);
}

mioCanvas.onmousemove	= callbackMovimentoMouse;
mioCanvas.onwheel 		= callbackMovimentoRotella;


function animaLaScena( msec ){
	var sec = msec / 1000;
	miaMeshElicottero.matrix = matriceTraslazione( Math.sin( sec *1.5 ) * 2.0 , 2, Math.cos( sec*1.5 ) * 4.0 );
	rasterizzatore.render(scena, miaCamera);

	miaMeshElica.matrix = new THREE.Matrix4();
	miaMeshElica.matrix.multiply( matriceTraslazione(0, .55, 0) );
	miaMeshElica.matrix.multiply( matriceRotazioneY( msec ) );
	miaMeshElica.matrix.multiply( matriceScalatura(0.2,0.1,3) );


	window.requestAnimationFrame(animaLaScena);
}

animaLaScena(0);