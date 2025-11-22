     // 全局数据
    const appData = {
      collections: JSON.parse(localStorage.getItem('山河印记')) || [],
      currentPuzzle: null,
      puzzlePieces: [],
      puzzleCompleted: 0
    };

    // 显示提示框
    function showToast(message) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.classList.add('show');
      
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2000);
    }

    // 打乱数组顺序
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    // DOM加载完成后执行
    document.addEventListener('DOMContentLoaded', () => {
      // 分类标签切换
      const categoryBtns = document.querySelectorAll('.category-btn');
      const sceneryCards = document.querySelectorAll('.scenery-card');
      
      categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          // 更新按钮样式
          categoryBtns.forEach(b => {
            b.classList.remove('active', 'bg-ink', 'text-rice');
            b.classList.add('border', 'border-ink-30', 'hover:bg-ink-10');
          });
          btn.classList.add('active', 'bg-ink', 'text-rice');
          btn.classList.remove('border', 'border-ink-30', 'hover:bg-ink-10');
          
          // 筛选卡片
          const category = btn.dataset.category;
          sceneryCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
              card.style.display = 'block';
            } else {
              card.style.display = 'none';
            }
          });
        });
      });

      // 深度探索弹窗
      const exploreBtns = document.querySelectorAll('.explore-btn');
      const exploreModal = document.getElementById('exploreModal');
      const modalOverlay = document.getElementById('modalOverlay');
      const closeModal = document.getElementById('closeModal');
      const modalTitle = document.getElementById('modalTitle');
      const modalContent = document.getElementById('modalContent');
      const modalImage = document.getElementById('modalImage');
      const sceneAudio = document.getElementById('sceneAudio');
      const collectBtn = document.getElementById('collectBtn');
      const modalContent2= document.getElementById('modalContent2');
      
      let currentScene = null;
      
      exploreBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          currentScene = {
            name: btn.dataset.name,
            desc: btn.dataset.desc,
            audio: btn.dataset.audio,
            story: btn.dataset.story, 
            image: btn.closest('.scenery-card').querySelector('img').src,
            story:btn.dataset.story,
          };
          
          // 填充弹窗内容
          modalTitle.textContent = currentScene.name;
          modalContent.innerHTML = `<p>${currentScene.desc}</p>`;
          modalImage.src = currentScene.image;
          sceneAudio.src = currentScene.audio;
          modalContent2.innerHTML = `<p>${currentScene.story}</p>`;
          
          // 更新收藏按钮状态
          const isCollected = appData.collections.some(item => item.name === currentScene.name);
          collectBtn.innerHTML = isCollected ? '★' : '☆';
          
          // 显示弹窗并播放音频
          exploreModal.classList.add('show');
          sceneAudio.play().catch(e => console.log('音频自动播放失败:', e));
          document.body.style.overflow = 'hidden';
        });
      });
      
      // 关闭弹窗
      const closeExploreModal = () => {
        exploreModal.classList.remove('show');
        sceneAudio.pause();
        document.body.style.overflow = '';
      };
      
      closeModal.addEventListener('click', closeExploreModal);
      modalOverlay.addEventListener('click', closeExploreModal);

      // 收藏功能
      collectBtn.addEventListener('click', () => {
        if (!currentScene) return;
        
        const index = appData.collections.findIndex(item => item.name === currentScene.name);
        if (index === -1) {
          // 添加收藏
          appData.collections.push(currentScene);
          collectBtn.innerHTML = '★';
          showToast(`已收藏「${currentScene.name}」`);
        } else {
          // 取消收藏
          appData.collections.splice(index, 1);
          collectBtn.innerHTML = '☆';
          showToast(`已取消收藏「${currentScene.name}」`);
        }
        
        // 保存到本地存储并更新收藏列表
        localStorage.setItem('山河印记', JSON.stringify(appData.collections));
        updateCollectionList();
      });
      
           // 更新收藏列表（改造版：在“我的山河印记”里生成可点击卡片）
      function updateCollectionList() {
        const collectionList = document.getElementById('collectionList');
        
        if (appData.collections.length === 0) {
          collectionList.innerHTML = `
            <div class="col-span-full flex items-center justify-center h-40 border-2 border-dashed border-ink-20 text-ink-50">
              <p>暂无收藏，快去浏览添加吧</p>
            </div>
          `;
          return;
        }
        
        collectionList.innerHTML = '';
        
        appData.collections.forEach((item, index) => {
          //点击后在新标签页打开相关网页
          const card = document.createElement('a');
          card.href = `https://www.bing.com/search?q=${encodeURIComponent(item.name)}`;
          card.target = '_blank';
          card.rel = 'noopener noreferrer';
          card.className = 'relative group overflow-hidden rounded border border-ink-20';
          
          card.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="w-full aspect-square object-cover">
            <div class="absolute inset-0 bg-ink-60 opacity-0 transition-opacity flex items-center justify-center group-hover:opacity-100">
              <p class="text-rice text-sm text-center">${item.name}</p>
            </div>
            <button class="absolute top-1 right-1 w-6 h-6 bg-ink-50 text-rice rounded-full flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 delete-collection" data-index="${index}">
              <span class="text-xs">✕</span>
            </button>
          `;
          
          collectionList.appendChild(card);
        });
        
        // 删除收藏（阻止 <a> 本身的跳转）
        document.querySelectorAll('.delete-collection').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const index = parseInt(e.currentTarget.dataset.index);
            const deletedName = appData.collections[index].name;
            appData.collections.splice(index, 1);
            localStorage.setItem('山河印记', JSON.stringify(appData.collections));
            updateCollectionList();
            showToast(`已移除「${deletedName}」`);
          });
        });
      }

      
      // 初始化收藏列表
      updateCollectionList();
      
// 拼图游戏
const puzzleSelectors = document.querySelectorAll('.puzzle-selector');
const puzzleContainer = document.getElementById('puzzleContainer');
const puzzlePlaceholder = document.getElementById('puzzlePlaceholder');
const resetPuzzle = document.getElementById('resetPuzzle');

// 选择拼图图片
puzzleSelectors.forEach(selector => {
  selector.addEventListener('click', () => {
    const imgUrl = selector.dataset.img;
    initPuzzle(imgUrl);
  });
});

// 初始化拼图
function initPuzzle(imgUrl) {
  appData.currentPuzzle = imgUrl;
  appData.puzzlePieces = [];
  puzzleContainer.innerHTML = '';
  
  // 创建4x3的拼图碎片
  const rows = 3;
  const cols = 4;
  const pieceWidth = 100 / cols;
  const pieceHeight = 100 / rows;
  
  // 生成碎片位置数组
  const positions = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      positions.push({ row: i, col: j });
    }
  }
  
  // 打乱顺序
  shuffleArray(positions);
  
  // 创建碎片
  positions.forEach((pos, index) => {
    const piece = document.createElement('div');
    const correctRow = Math.floor(index / cols);
    const correctCol = index % cols;
    
    piece.className = 'absolute cursor-grab active:cursor-grabbing transition-all';
    piece.style.width = `${pieceWidth}%`;
    piece.style.height = `${pieceHeight}%`;
    piece.style.left = `${pos.col * pieceWidth}%`;
    piece.style.top = `${pos.row * pieceHeight}%`;
    piece.style.backgroundImage = `url(${imgUrl})`;
    piece.style.backgroundSize = `${cols * 100}% ${rows * 100}%`;
    piece.style.backgroundPosition = `${-correctCol * (100 / (cols - 1))}% ${-correctRow * (100 / (rows - 1))}%`;
    piece.style.border = '1px solid rgba(255,255,255,0.3)';
    
    // 存储正确位置信息
    piece.dataset.correctRow = correctRow;
    piece.dataset.correctCol = correctCol;
    piece.dataset.currentRow = pos.row;
    piece.dataset.currentCol = pos.col;
    piece.dataset.index = index;
    
    // 添加拖拽功能
    makeDraggable(piece);
    puzzleContainer.appendChild(piece);
    appData.puzzlePieces.push(piece);
  });
}

// 重置拼图
resetPuzzle.addEventListener('click', () => {
  if (appData.currentPuzzle) {
    initPuzzle(appData.currentPuzzle);
  }
});

// 拖拽功能实现
function makeDraggable(element) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  const pieceWidth = 100 / 4; // 4列
  const pieceHeight = 100 / 3; // 3行
  
  element.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    
    // 将当前元素置于顶层
    appData.puzzlePieces.forEach(piece => {
      piece.style.zIndex = 1;
    });
    element.style.zIndex = 10;
    
    // 获取鼠标初始位置
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // 当鼠标移动时调用elementDrag函数
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // 计算新的光标位置
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    
    // 设置元素新的位置
    const containerRect = puzzleContainer.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    
    let newTop = element.offsetTop - pos2;
    let newLeft = element.offsetLeft - pos1;
    
    // 限制在容器内
    newTop = Math.max(0, Math.min(newTop, containerRect.height - elementRect.height));
    newLeft = Math.max(0, Math.min(newLeft, containerRect.width - elementRect.width));
    
    element.style.top = newTop + "px";
    element.style.left = newLeft + "px";
  }
  
  function closeDragElement() {
    // 停止移动
    document.onmouseup = null;
    document.onmousemove = null;
    
    // 计算当前位置所在的网格
    const containerRect = puzzleContainer.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    
    const relativeLeft = (elementRect.left - containerRect.left) / containerRect.width * 100;
    const relativeTop = (elementRect.top - containerRect.top) / containerRect.height * 100;
    
    // 计算最近的网格位置
    let targetCol = Math.round(relativeLeft / pieceWidth);
    let targetRow = Math.round(relativeTop / pieceHeight);
    
    // 限制在有效范围内
    targetCol = Math.max(0, Math.min(targetCol, 3));
    targetRow = Math.max(0, Math.min(targetRow, 2));
    
    // 检查目标位置是否已有其他拼图
    const currentRow = parseInt(element.dataset.currentRow);
    const currentCol = parseInt(element.dataset.currentCol);
    
    // 查找目标位置的拼图
    const targetPiece = findPieceAtPosition(targetRow, targetCol);
    
    if (targetPiece && targetPiece !== element) {
      // 交换位置
      swapPieces(element, targetPiece);
    } else {
      // 直接移动到目标位置
      element.style.left = `${targetCol * pieceWidth}%`;
      element.style.top = `${targetRow * pieceHeight}%`;
      
      // 更新当前位置数据
      element.dataset.currentRow = targetRow;
      element.dataset.currentCol = targetCol;
    }
    
    // 重置z-index
    element.style.zIndex = 1;
  }
}

// 查找指定位置的拼图
function findPieceAtPosition(row, col) {
  return appData.puzzlePieces.find(piece => 
    parseInt(piece.dataset.currentRow) === row && 
    parseInt(piece.dataset.currentCol) === col
  );
}

// 交换两个拼图的位置
function swapPieces(piece1, piece2) {
  // 保存位置信息
  const row1 = parseInt(piece1.dataset.currentRow);
  const col1 = parseInt(piece1.dataset.currentCol);
  const row2 = parseInt(piece2.dataset.currentRow);
  const col2 = parseInt(piece2.dataset.currentCol);
  
  // 交换位置
  piece1.style.left = `${col2 * (100 / 4)}%`;
  piece1.style.top = `${row2 * (100 / 3)}%`;
  piece2.style.left = `${col1 * (100 / 4)}%`;
  piece2.style.top = `${row1 * (100 / 3)}%`;
  
  // 更新数据
  piece1.dataset.currentRow = row2;
  piece1.dataset.currentCol = col2;
  piece2.dataset.currentRow = row1;
  piece2.dataset.currentCol = col1;
}
    });