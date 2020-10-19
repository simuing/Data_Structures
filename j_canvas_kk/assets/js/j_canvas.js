/*********************************************************************************************
 *  Function명 : setCanvas
 *  설명       : 캔버스 초기 설정
*********************************************************************************************/
function setCanvas(canvas){
    $ctx = document.getElementById(canvas).getContext("2d");
    
    //canvas resize
    $ctx.canvas.height = document.getElementById(canvas).clientHeight;
    $ctx.canvas.width = document.getElementById(canvas).clientWidth;
}

/*********************************************************************************************
 *  Function명 : setCanvasEvent
 *  설명       : 캔버스 마우스 free draw 이벤트 설정
*********************************************************************************************/
function setCanvasEvent(canvas){
	let ctx = document.getElementById(canvas);
	
	$(ctx).mousedown(function (e) {
        mousePressed = true;
        canvasDraw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false);
    });

	$(ctx).mousemove(function (e) {
        if (mousePressed) {
        	canvasDraw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
        }
    });
	
	$(ctx).mouseup(function (e) {
        mousePressed = false;
        canvasDraw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
        cPush(canvas);
    });
    
	$(ctx).mouseleave(function (e) {
        mousePressed = false;
    });
}

/*********************************************************************************************
 *  Function명 : setCanvasEvent
 *  설명       : 캔버스 마우스 line 이벤트 설정
*********************************************************************************************/
function setCanvasEventLine(canvas){
	let ctx = document.getElementById(canvas);
	
	$(ctx).mousedown(function (e) {
        mousePressed = true;
        
        if(lastX==0 && lastY==0){
        	lastX = e.pageX - $(this).offset().left;
        	lastY = e.pageY - $(this).offset().top;
        	
        	canvasDraw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
        }
    });

	$(ctx).mousemove(function (e) {
    });
	
	$(ctx).mouseup(function (e) {
        mousePressed = false;
        canvasDraw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
        cPush(canvas);
    });
    
	$(ctx).mouseleave(function (e) {
        mousePressed = false;
    });
}

/*********************************************************************************************
 *  Function명 : canvasDraw
 *  설명       : canvas drawing event setting
*********************************************************************************************/
function canvasDraw(currX, currY, isDown) {
    if (isDown) {
        $ctx.beginPath();
        $ctx.strokeStyle = $('#selColor').val();
        $ctx.lineWidth = $('#selWidth').val();
        $ctx.lineJoin = "round";
        $ctx.moveTo(lastX, lastY);
        $ctx.lineTo(currX, currY);
        $ctx.closePath();
        $ctx.stroke();
    }
    lastX = currX;
    lastY = currY;
}

/*********************************************************************************************
 *  Function명 : cPush
 *  설명       : canvas 수정이력 추가(cStep을 1씩 증가)
*********************************************************************************************/
function cPush(canvas) {
    cStep++;
    if (cStep < cPushArray.length) { cPushArray.length = cStep; }
    cPushArray.push(document.getElementById(canvas).toDataURL());
}

/*********************************************************************************************
 *  Function명 : cUndo
 *  설명       : 뒤로가기
*********************************************************************************************/
function cUndo() {
    if (cStep>1) {
        cStep = cStep-2;
        let canvasPic = new Image();
        canvasPic.src = cPushArray[cStep];
        canvasPic.onload = function () { $ctx.drawImage(canvasPic, 0, 0); }
        
    }else if(cStep==1){
    	cStep = 0
        let canvasPic = new Image();
        canvasPic.src = cPushArray[cStep];
        canvasPic.onload = function () { $ctx.drawImage(canvasPic, 0, 0); }
    }
}

/*********************************************************************************************
 *  Function명 : cRedo
 *  설명       : 앞으로가기
*********************************************************************************************/
function cRedo() {
    if (cStep < cPushArray.length - 1) {
        cStep++;
        let canvasPic = new Image();
        canvasPic.src = cPushArray[cStep];
        canvasPic.onload = function () { $ctx.drawImage(canvasPic, 0, 0); }
    }
}

/*********************************************************************************************
 *  Function명 : canvasSelectChange
 *  설명       : 캔버스 속성 교체 
*********************************************************************************************/
function canvasSelectChange(id, value){
	document.getElementById(id).value = value;
	
	if(id=="selColor"){ 
		$(".canvasSelectColor").css("border", "none");
		$("#selColor_"+value).css("border", "1px solid white");
	}
}

/*********************************************************************************************
 *  Function명 : canvasImageChange
 *  설명       : 캔버스 이미지 교체
*********************************************************************************************/
function canvasImageChange(){
	let img = document.getElementById("img");
	
	$ctx.drawImage(img, 0, 0, $ctx.canvas.width, $ctx.canvas.height);
	
	//수정이력 초기화
    cPushArray = new Array();
    cStep = 0;
    cPush($ctx.canvas.id);
    
    //mouse event setting
	setCanvasEvent($ctx.canvas.id);
}

/*********************************************************************************************
 *  Function명 :canvasClear
 *  설명       : 캔버스 완전 초기화
*********************************************************************************************/
function canvasClear(subtyp) { 
	//image clear
    let img = document.getElementById("img");
    
    //canvas clear
    $ctx.setTransform(1, 0, 0, 1, 0, 0);
    $ctx.clearRect(0, 0, $ctx.canvas.width, $ctx.canvas.height);
    
    //수정이력 초기화
    cPushArray = new Array();
    cStep = 0;
}

/*********************************************************************************************
 *  Function명 : exportAndSaveCanvas
 *  설명       : 캔버스 이미지를 base64 로 incode 하여 저장
 *             canvas img -> base64 incode (image/png)
*********************************************************************************************/
function exportAndSaveCanvas(canvas, subtyp, status){ 
	let base64 = document.getElementById(canvas).toDataURL("image/png");
	let orifile = document.getElementById("file"); //원본 이미지파일
	let fileName = $("#attach"+" a")[0].text.split(".")[0]+".png";
	let url = "";
	
	if(status == "insert"){ //(등록)
		url = orifile.value.split(".")[0]+".png"; //new 파일경로
		
	}else if (status == "update"){ //(수정)
		url = fileName;
	}
	
	//file info setting
	let file = new Object();
	file.fileName = fileName;
	file.base64 = base64;
	file.url = url;
	
	file_upload_canvas2(subtyp, file); //file upload
	document.getElementById("img").src = base64; //file img change
}


/*********************************************************************************************
 *  설명       : 첨부파일 (단일 이미지) 캔버스이미지 업로드 (SM2141_write 참고) 
 *              이미지 업로드시, 캔버스 드로잉 후 이미지 재업로드 실행
 *  작성자      : 장은영
 *  수정이력    : 2019-02-14 최초작성
*********************************************************************************************/
function file_upload_canvas2(subtyp, file){
	//해당 파일 영역의 아이디 값 가져오기
	let id = "file";
	let attach = "attach";
	
	//다중 업로드 파일 데이터 세팅
	let fileData = new FormData();
	let fileName = file.fileName; //파일명
	let fileExt= fileName.split(".")[1].toLowerCase(); //확장자명
	
	//base64 코드 전송
	fileData.append("id", id); 
	fileData.append("base64", file.base64);
	fileData.append("fileName", file.fileName);
	fileData.append("url", file.url);

	//단일파일(기존 출력 파일 제거 후 재출력)
	if ($("#attach"+" .file_list_td").length > 0){ //이미 출력된 파일이 있을 경우 다시 세팅
		$("#attach"+" .file_list_td").remove();
	}
	
	
	//image info setting
	let info = new Object();
	info.id = newFileName.split(".")[0]; 
	info.newnam = newFileName; 
	//info.orgnam = data[0].orgFileName;
	info.base64 = document.getElementById("img").src;  //이미지 base64 code(등록/수정페이지에서 미리보기로 활용)
	
	let data2 = JSON.stringify(info);
	eval("opener." + $("#callback").val() + "("+ data2 +")");
	
	window.close();


}

