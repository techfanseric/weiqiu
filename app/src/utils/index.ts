var getUniqueIdPrevTime = 0;
var getUniqueIdNowCount = 1;
	// 获取唯一Id
export const	getUniqueId = ()=> {
	let now = Date.now();
	let now32 = now.toString(32);
	if (now == getUniqueIdPrevTime) {
		getUniqueIdNowCount++;
	} else {
		getUniqueIdNowCount = 1;
	}
	getUniqueIdPrevTime = now;
	return `N_${now32}_${getUniqueIdNowCount}`;
}

export const isNumericString = (str: string)=> {
  return /^[-+]?\d*(\.\d+)?$/.test(str);
}


export const importFile = (fileType: string)=> {
	return new Promise((resolve, reject) => {
		let input = document.createElement('input');

		input.type = 'file';
		if(fileType === '*'){
			input.accept = '*/*';
		}else if(fileType === 'json'){
			input.accept = '.json,application/json';
		}else if(fileType === 'csv'){
			input.accept = '.csv,text/csv';
		}else if(fileType === 'xlsx'){
			input.accept = '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
		}else if(fileType === 'xls'){
			input.accept = '.xls,application/vnd.ms-excel';
		}else if(fileType === 'txt'){
			input.accept = '.txt,text/plain';
		}else if(fileType === 'xml'){
			input.accept = '.xml,application/xml';
		}else if(fileType === 'html'){
			input.accept = '.html,text/html';
		}else if(fileType === 'image'){
			input.accept = '.png,image/png,.jpg,image/jpeg,.gif,image/gif,.bmp,image/bmp,.webp,image/webp';
		}else{
			input.accept = fileType;
		}
		input.style.display = 'none';

		document.body.appendChild(input);

		input.addEventListener('change', (e: any) => {
			resolve(e.target.files[0]);
		});

		window.addEventListener('focus', () => {
			setTimeout(() => {
				try {
					document.body.removeChild(input);
				} catch (error) { }

				reject();
			}, 1000);
		});

		input.click();
	});
}


// 读取文件内容
export const readFileText = (file: any)=> {
	return new Promise((resolve, reject) => {
		let fileReader = new FileReader();

		fileReader.readAsText(file, 'utf8');

		fileReader.onload = (res: any) => {
			resolve(res.target.result);
		}
		fileReader.onerror = (err) => {
			reject(err);
		}
	});
}


export const exportTextAsFile = (text: string, fileName: string)=> {
	fileName = fileName || 'export-' + new Date().getTime() + '.txt';

	//type 限制文件类型 application/octet-stream
	let blob = new Blob([text]);

	// 创建新的URL并指向File对象或者Blob对象的地址
	let blobURL = window.URL.createObjectURL(blob);

	// 通过url导出文件
	exportUrlFile(blobURL, fileName);

	// 释放blob URL地址
	window.URL.revokeObjectURL(blobURL);
}
// 通过url导出文件
export const  exportUrlFile = (url: string, fileName = '')=> {
	if (!fileName) {
		let splits = url.split('/');
		fileName = splits[splits.length - 1];
	}

	// 创建a标签，用于跳转至下载链接
	let tempLink = document.createElement('a');

	tempLink.style.display = 'none';
	tempLink.href = url;
	tempLink.setAttribute('download', decodeURI(fileName));

	// 兼容：某些浏览器不支持HTML5的download属性
	if (typeof tempLink.download === 'undefined') {
		tempLink.setAttribute('target', '_blank');
	}

	// 挂载a标签
	document.body.appendChild(tempLink);

	// 触发点击
	tempLink.click();

	// 移除链接元素
	document.body.removeChild(tempLink);
}




export const fetchData = async(url:string)=>{
	let res = await fetch(url);
	return res.json();
}


/**
* 生成一个随机的十六进制颜色值
*
* @returns 返回一个随机的十六进制颜色值，格式为 '#RRGGBB'
*/
export const getRandomColor = ()=> {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


/**
* 将多个颜色按百分比混合成一个颜色
*
* @param colors 包含颜色和对应百分比的数组，每个对象有 color（颜色值，十六进制字符串形式）和 percentage（百分比）两个属性
* @returns 混合后的颜色，十六进制字符串形式
*/
export function mixColors(colors) {
    function hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) {
            hex = hex.split('').map(x => x + x).join('');
        }
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b };
    }

    function rgbToHex(rgb) {
        const r = Math.round(rgb.r).toString(16).padStart(2, '0');
        const g = Math.round(rgb.g).toString(16).padStart(2, '0');
        const b = Math.round(rgb.b).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }

    let totalPercentage = 0;
    let mixedRgb = { r: 0, g: 0, b: 0 };

    for (const color of colors) {
        totalPercentage += color.percentage;
    }

    for (const color of colors) {
        const rgb = hexToRgb(color.color);
        mixedRgb.r += (rgb.r * color.percentage) / totalPercentage;
        mixedRgb.g += (rgb.g * color.percentage) / totalPercentage;
        mixedRgb.b += (rgb.b * color.percentage) / totalPercentage;
    }

    return rgbToHex(mixedRgb);
}


export const getUrl = ()=> {
  if(import.meta.env.PROD){
    return `${location.origin}`
  }
  return import.meta.env.VITE_API_BASE_URL
}


export async function copyToClipboard(text: string) {
  if(document.execCommand) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }else {
    await navigator.clipboard.writeText(text);
  }
}