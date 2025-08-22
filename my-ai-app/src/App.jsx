import { useState, useEffect, useRef } from 'react';

// --- ДАННЫЕ ---
// Полный список категорий, как и был в самом начале
const categoriesData = [
  { name: "Маркетинг", subcategories: [{ name: "Письма", prompt: "Напиши эффективное маркетинговое письмо для продукта X." }, { name: "Соцсети", prompt: "Создай привлекательный пост для соцсетей о продукте Y." }, { name: "Стратегии", prompt: "Опиши стратегию продвижения нового бренда." },], },
  { name: "Финансы", subcategories: [{ name: "Анализ инвестиций", prompt: "Сделай анализ инвестиционного портфеля." }, { name: "Расчёт налогов", prompt: "Помоги рассчитать налоги для малого бизнеса." }, { name: "Планирование бюджета", prompt: "Создай план бюджета на следующий квартал." }, { name: "Составление договоров", prompt: "Подготовь шаблон финансового договора." }, { name: "Финансовый аудит", prompt: "Проведи финансовый аудит компании." },], },
  { name: "Программирование", subcategories: [{ name: "Отладка", prompt: "Помоги найти и исправить ошибку в коде." }, { name: "Скрипты", prompt: "Напиши скрипт для автоматизации задачи X." }, { name: "Документация", prompt: "Создай документацию для API." },], },
  { name: "Креатив", subcategories: [{ name: "Истории", prompt: "Напиши короткую фантастическую историю." }, { name: "Стихи", prompt: "Создай стихотворение на тему космоса." }, { name: "Сценарии", prompt: "Разработай сценарий для видеоролика." },], },
  { name: "Образование", subcategories: [{ name: "Объяснения", prompt: "Объясни сложную тему простыми словами." }, { name: "Тесты", prompt: "Создай тест по теме математики." }, { name: "Планы", prompt: "Разработай учебный план на месяц." },], },
  { name: "Юриспруденция", subcategories: [{ name: "Договоры", prompt: "Подготовь шаблон договора аренды." }, { name: "Консультации", prompt: "Дай консультацию по трудовому праву." },], },
  { name: "Технологии", subcategories: [{ name: "Обзоры", prompt: "Напиши обзор на новый гаджет." }, { name: "Тренды", prompt: "Опиши текущие тренды в IT." },], },
  { name: "Здоровье", subcategories: [{ name: "Питание", prompt: "Создай план здорового питания." }, { name: "Фитнес", prompt: "Разработай программу тренировок." },], },
  { name: "Путешествия", subcategories: [{ name: "Маршруты", prompt: "Предложи маршрут для путешествия по Европе." }, { name: "Советы", prompt: "Дай советы для бюджетного путешествия." },], },
  { name: "Искусство", subcategories: [{ name: "Рисование", prompt: "Опиши технику рисования акварелью." }, { name: "Музыка", prompt: "Создай текст для песни в стиле джаз." },], },
  { name: "Бизнес", subcategories: [{ name: "Стратегии", prompt: "Разработай бизнес-стратегию для стартапа." }, { name: "Аналитика", prompt: "Сделай анализ рынка для продукта." },], },
  { name: "Психология", subcategories: [{ name: "Советы", prompt: "Дай советы по управлению стрессом." }, { name: "Техники", prompt: "Опиши техники медитации." },], },
  { name: "Наука", subcategories: [{ name: "Исследования", prompt: "Объясни последние открытия в физике." }, { name: "Обзоры", prompt: "Создай обзор научной статьи." },], },
  { name: "Литература", subcategories: [{ name: "Анализ", prompt: "Проанализируй произведение классической литературы." }, { name: "Рецензии", prompt: "Напиши рецензию на книгу." },], },
  { name: "Кулинария", subcategories: [{ name: "Рецепты", prompt: "Предложи рецепт здорового блюда." }, { name: "Советы", prompt: "Дай советы по приготовлению выпечки." },], },
  { name: "Маркетплейсы", subcategories: [{ name: "Оптимизация", prompt: "Оптимизируй карточку товара для маркетплейса." }, { name: "Продажи", prompt: "Разработай стратегию увеличения продаж." },], },
  { name: "Социальные проекты", subcategories: [{ name: "Идеи", prompt: "Предложи идеи для социального проекта." }, { name: "Планирование", prompt: "Создай план реализации проекта." },], },
  { name: "Экология", subcategories: [{ name: "Советы", prompt: "Дай советы по снижению углеродного следа." }, { name: "Образование", prompt: "Объясни важность переработки отходов." },], },
  { name: "Автомобили", subcategories: [{ name: "Обзоры", prompt: "Напиши обзор на электромобиль." }, { name: "Советы", prompt: "Дай советы по уходу за автомобилем." },], },
  { name: "Мода", subcategories: [{ name: "Тренды", prompt: "Опиши модные тренды сезона." }, { name: "Советы", prompt: "Дай советы по подбору гардероба." },], },
];

// Оставляем только те модели, которые поддерживает наш сервер
const aiModels = [
  { id: "gemini", name: "Gemini" },
  { id: "chatgpt4", name: "ChatGPT 4" },
];

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
const saveToStorage = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
const loadFromStorage = (key, defaultValue) => { try { const val = localStorage.getItem(key); return val ? JSON.parse(val) : defaultValue; } catch { return defaultValue; }};

// --- ГЛАВНЫЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ ---
function App() {
  const [selectedModel, setSelectedModel] = useState(() => loadFromStorage("selectedModel", aiModels[0].id));
  const [prompt, setPrompt] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(() => loadFromStorage("promptHistory", []));
  const [theme, setTheme] = useState(() => loadFromStorage("theme", "dark"));
  const [output, setOutput] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const promptRef = useRef(null);
  const outputRef = useRef(null);

  useEffect(() => { saveToStorage("selectedModel", selectedModel); }, [selectedModel]);
  useEffect(() => { saveToStorage("promptHistory", history); }, [history]);
  useEffect(() => { saveToStorage("theme", theme); }, [theme]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.altKey && e.key === "m") { e.preventDefault(); setSidebarOpen((v) => !v); }
      if (e.altKey && e.key === "g" && prompt.trim() && !loading) { e.preventDefault(); handleGenerate(); }
      if (e.altKey && e.key === "t") { e.preventDefault(); setTheme((t) => (t === "dark" ? "light" : "dark")); }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prompt, selectedModel, loading]);

  function handleModelChange(e) { setSelectedModel(e.target.value); }
  function handleCategoryClick(category) { setActiveCategory(activeCategory?.name === category.name ? null : category); }
  function handleSubcategoryClick(subcat) { setPrompt(subcat.prompt); setSidebarOpen(false); promptRef.current?.focus(); }
  function handlePromptChange(e) { setPrompt(e.target.value); }

  // ==================================================================
  //           ✅ НОВАЯ ФУНКЦИЯ ДЛЯ РАБОТЫ С СЕРВЕРОМ ✅
  // ==================================================================
  function handleGenerate() {
    if (!prompt.trim() || loading) return;

    setOutput("");
    setLoading(true);

    fetch('http://localhost:3001/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: prompt,
            model: selectedModel
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            setOutput(data.text);
        } else {
            setOutput(`Произошла ошибка: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Ошибка при отправке запроса на сервер:', error);
        setOutput('Не удалось связаться с сервером. Убедитесь, что он запущен.');
    })
    .finally(() => {
        setLoading(false);
        setHistory((h) => [prompt.trim(), ...h.filter((p) => p !== prompt.trim())].slice(0, 10));
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
  }
  
  function handleClearPrompt() { setPrompt(""); promptRef.current?.focus(); }
  function handleCopyOutput() { if (!output) return; navigator.clipboard.writeText(output).then(() => { setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }); }
  function handleExport() { if (!prompt.trim()) return; const blob = new Blob([prompt], { type: "text/plain;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "prompt.txt"; a.click(); URL.revokeObjectURL(url); }
  function handleHistoryClick(item) { setPrompt(item); promptRef.current?.focus(); }

  const isDark = theme === "dark";

  return (
    <div className={`${isDark ? "bg-[#0a0a14] text-[#d4af37]" : "bg-gray-100 text-[#7a5e1a]"} min-h-screen flex flex-col md:flex-row font-sans relative`}>
      <button aria-label="Toggle categories menu" onMouseEnter={() => setSidebarOpen(true)} onMouseLeave={() => setSidebarOpen(false)} className="fixed top-4 left-4 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-[#bfa75a] to-[#7a5e1a] text-black flex items-center justify-center shadow-lg cursor-pointer transition-transform hover:scale-110" title="Категории (Alt+M)">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>

      <aside onMouseEnter={() => setSidebarOpen(true)} onMouseLeave={() => setSidebarOpen(false)} className={`fixed top-0 left-0 h-full w-64 bg-[#121212] bg-opacity-95 backdrop-blur-md shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0`}>
        <nav className="flex flex-col h-full overflow-y-auto py-6 px-4 select-none">
          <h2 className="text-xl font-orbitron mb-4 border-b border-[#bfa75a] pb-2">Категории</h2>
          <ul className="flex flex-col gap-1">
            {categoriesData.map((cat) => (
              <li key={cat.name}>
                <button onClick={() => handleCategoryClick(cat)} className={`w-full text-left px-3 py-2 rounded-md font-semibold text-sm hover:bg-[#bfa75a33] focus:outline-none focus:bg-[#bfa75a55] transition-colors flex justify-between items-center ${activeCategory?.name === cat.name ? "bg-[#bfa75a55]" : ""}`} aria-expanded={activeCategory?.name === cat.name}>
                  {cat.name}
                  <svg className={`w-4 h-4 ml-2 transition-transform ${activeCategory?.name === cat.name ? "rotate-90" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
                </button>
                {activeCategory?.name === cat.name && (
                  <ul className="mt-1 ml-4 border-l border-[#bfa75a55] pl-3 max-h-48 overflow-y-auto">
                    {cat.subcategories.map((subcat) => ( <li key={subcat.name}> <button onClick={() => handleSubcategoryClick(subcat)} className="w-full text-left text-sm py-1 px-2 rounded-md hover:bg-[#bfa75a22] focus:outline-none focus:bg-[#bfa75a44] transition-colors">{subcat.name}</button> </li>))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-24 md:px-12 relative">
        <div className="w-full max-w-md mb-12">
          <label htmlFor="model-select" className="block mb-2 text-sm font-semibold text-[#bfa75a] select-none">Выберите AI-модель</label>
          <select id="model-select" value={selectedModel} onChange={handleModelChange} disabled={loading} className="w-full bg-[#121212] border border-[#bfa75a] rounded-md py-3 px-4 text-[#d4af37] text-lg font-semibold appearance-none cursor-pointer shadow-[0_0_10px_#bfa75a] focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition disabled:opacity-50">
            {aiModels.map((model) => (<option key={model.id} value={model.id}>{model.name}</option>))}
          </select>
        </div>

        <div className="w-full max-w-3xl relative">
          <textarea ref={promptRef} value={prompt} onChange={handlePromptChange} placeholder="Введите свой промпт..." rows={6} disabled={loading} className="w-full rounded-lg border border-[#bfa75a] bg-transparent py-4 px-6 text-[#d4af37] text-lg resize-none shadow-[0_0_15px_#bfa75a] glow-focus transition-all duration-300 placeholder:text-[#bfa75aaa] disabled:opacity-50" />
          {prompt && !loading && (<button onClick={handleClearPrompt} className="absolute top-3 right-3 text-[#bfa75aaa] hover:text-[#d4af37] transition-colors" title="Очистить поле"><svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>)}
        </div>

        <div className="mt-10 flex flex-wrap gap-6 justify-center items-center">
          <button onClick={handleGenerate} disabled={loading || !prompt.trim()} className="relative inline-flex items-center justify-center rounded-full px-14 py-3 font-semibold text-black shadow-lg transition-transform hover:scale-105 bg-gradient-to-r from-[#d4af37] to-[#7a5e1a] disabled:opacity-50 disabled:cursor-not-allowed">
            {loading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>}
            {loading ? "Обработка..." : "Сделать"}
          </button>
          <button onClick={handleExport} disabled={!prompt.trim() || loading} className="inline-flex items-center justify-center rounded-full px-8 py-3 font-semibold text-[#d4af37] border border-[#d4af37] shadow-md hover:bg-[#bfa75a33] transition disabled:opacity-50">
            Экспорт <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          </button>
        </div>
        
        <div ref={outputRef} className="w-full max-w-3xl mt-12 min-h-[10rem]">
          {(loading || output) && (<div className="bg-[#121212] border border-[#bfa75a] rounded-lg shadow-[0_0_15px_#bfa75a] p-6 relative">
              <h3 className="text-lg font-orbitron mb-4">Результат генерации</h3>
              {loading ? ( <div className="flex items-center justify-center h-24"><svg className="animate-spin h-8 w-8 text-[#d4af37]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V8a4 4 0 00-4 4H4z"></path></svg></div>) : (
                <>
                  <p className="text-white whitespace-pre-wrap text-base font-medium">{output}</p>
                  <button onClick={handleCopyOutput} className="absolute top-4 right-4 text-[#bfa75aaa] hover:text-[#d4af37] transition-colors px-3 py-1 border border-transparent hover:border-[#d4af37] rounded-md text-sm" title="Копировать результат">
                    {isCopied ? "Скопировано!" : (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>)}
                  </button>
                </>
              )}
          </div>)}
        </div>
      </main>
    </div>
  );
}

export default App;