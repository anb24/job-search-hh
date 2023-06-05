import { useState, useEffect } from "react";

import './HomePage.css';

function HomePage() {

    const [profRoleHH, setProfRoleHH] = useState([]);  //все названия вакансий по группам
	const [allProfRoleHH, setAllProfRoleHH] = useState([]);  //все названия вакансий без группировки
	const [reqInputValue, setReqInputValue] = useState(''); //текущее значение поля поиска req
	const [isOpen, setIsOpen] = useState(true); //открытие-ззакрытие поля подсказок в поиске
	const [dataHH, setDataHH] = useState([]); //весь ответ
	const [allPagesHH, setAllPagesHH] = useState(); //всего страниц
	const [dataTable, setDataTable] = useState([]); //только вакансии из ответа
	const [reqArea, setReqArea] = useState(); //значение поля регион
	const [reqInput, setReqInput] = useState(''); //значение поля поиска req
	const [reqSchedule, setReqSchedule] = useState(); //значение поля график
	const [sortedField, setSortedField] = useState("there"); //флаг для сортировки (направление)

    const schedule_db = [{id:"fullDay",name:"Полный день"},{id:"shift",name:"Сменный график"},{id:"flexible",name:"Гибкий график"},{id:"remote",name:"Удаленная работа"},{id:"flyInFlyOut",name:"Вахтовый метод"}];
    const areas_db = [{id:"113",name:"Регион не задан"},{id:"1",name:"Москва"},{id:"54",name:"Красноярск"},{id:"1146",name:"Красноярский край"},{id:"1124",name:"Иркутская область"},{id:"1169",name:"Республика Тыва"},{id:"1187",name:"Республика Хакасия"},{id:"1229",name:"Кемеровская область"},{id:"1255",name:"Томская область"},{id:"1216",name:"Республика Алтай"},{id:"1217",name:"Алтайский край"},{id:"1202",name:"Новосибирская область"},{id:"1249",name:"Омская область"}];

	console.log(dataHH);

//получаем все названия вакансий по группам
	useEffect(() => {
        fetch(`https://api.hh.ru/professional_roles`)
            .then(res=> res.json())
            .then(data => setProfRoleHH(data.categories));
    }, [])

//получаем все названия вакансий без группировки:
	useEffect(() => {
        function gettingAll() {
            const allProfRoleHH = [];
            profRoleHH.forEach(elem => {
                allProfRoleHH.push(elem.roles)
            })
            const allRole = [];
            for (let i = 0; i < allProfRoleHH.length; i++) {
                allProfRoleHH[i].forEach(e => {
                    allRole.push(e)
                })
            }
            setAllProfRoleHH(allRole)
        }gettingAll()
    }, [profRoleHH])

//вывод подсказок при вводе в поле поиска:
	const filteredRole = allProfRoleHH.filter(elem => {
		return elem.name.toLowerCase().includes(reqInputValue.toLowerCase())
	})

	const itemClickHandler = (e) => {
		setReqInputValue(e.target.textContent)
		setReqInput(e.target.textContent);
		setIsOpen(!isOpen);
	}

	const inputClickHandler = () => {
		setIsOpen(true);
	}

//запрос на получение данных с hh
    function reqData() {
        // console.log("сейчас reqSchedule", reqSchedule)
        // console.log("сейчас reqInput", reqInput)
        console.log("сейчас reqArea", reqArea)

        let id_area = "113";
        if(reqArea === "undefined") {
            return id_area = 113;
        } else {
            areas_db.forEach(elem => {
                if(elem.name === reqArea) {
                    return id_area = elem.id;
                }
            })
        }

        let id_rol = 1;
        allProfRoleHH.forEach(elem => {
            if(elem.name.toLowerCase() == reqInput.toLowerCase()){
                return id_rol = elem.id
            }
        })
        schedule_db.forEach(elem => {
            if(elem.name === reqSchedule) {
                fetch(`https://api.hh.ru/vacancies?clusters=true&professional_role=${id_rol}&area=${id_area}&per_page=100&page=0&schedule=${elem.id}`)
                    .then(res => res.json())
                    .then(data => (setDataHH(data), setAllPagesHH(data.pages), setDataTable(data.items)))
            }
            if(reqSchedule === undefined || reqSchedule === "График не задан") {
                fetch(`https://api.hh.ru/vacancies?clusters=true&professional_role=${id_rol}&area=${id_area}&per_page=100&page=0`)
                    .then(res => res.json())
                    .then(data => (setDataHH(data), setAllPagesHH(data.pages), setDataTable(data.items)))
            }
        })
    }

// поиск по таблице:
    function tableSearch() {
        var phrase = document.querySelector('.search-form__input');
        var table = document.querySelector('#table');
        var regPhrase = new RegExp(phrase.value, 'i');
        var flag = false;
        for (var i = 1; i < table.rows.length; i++) {
            flag = false;
            for (var j = table.rows[i].cells.length - 1; j >= 0; j--) {
                flag = regPhrase.test(table.rows[i].cells[j].innerHTML);
                if (flag) break;
            }
            if (flag) {
                    table.rows[i].style.display = "";
            } else {
                    table.rows[i].style.display = "none";
            }

        }
    }

// сортировка таблицы по столбцам:
	function sortColumn(id) {
		const table = document.querySelector('#table')
		if(sortedField === "there") {
			setSortedField("here");
			let sortedRows = Array.from(table.rows)
				.slice(1)
				.sort((rowA, rowB) => rowA.cells[id].innerHTML > rowB.cells[id].innerHTML ? 1 : -1);
			table.tBodies[0].append(...sortedRows);
		} else {
			setSortedField("there");
			let sortedRows = Array.from(table.rows)
				.slice(1)
			    .sort((rowB, rowA) => rowB.cells[id].innerHTML > rowA.cells[id].innerHTML ? -1 : 1);
			table.tBodies[0].append(...sortedRows);
		}
	}

    return (
        <div className={dataTable.length === 0 ? "home-page home-page_center" : "home-page"}>
			<header className="header">
				<h1 className="header__title">Поиск вакансий hh.ru</h1>
        	</header>

			<main className="main">
				<div className="request-box">
					<form className="request-form">
						<div className="request-box">
							<input className="request-form__input" value={reqInputValue} type="text" placeholder="Название вакансии..." onKeyUp={(e) => setReqInput(e.target.value)} onChange={(e) => setReqInputValue(e.target.value)} onClick={inputClickHandler}/>
							<ul className="autocomplete">
								{reqInputValue && isOpen ? filteredRole.map((role, index) => {
									return (
										<li className="autocomplete__item" key={index} onClick={itemClickHandler}>{role.name}</li>
									)
								}) : null}
							</ul>
						</div>
						<div className="request-container">
							<select className="request-form__select" onChange={(e) => setReqSchedule(e.target.value)}>
								<option>График не задан</option>
								{schedule_db.map((elem, index) => {
									return (
										<option id={elem.id} key={index}>{elem.name}</option>
									)
								})}
							</select>
							<select className="request-form__select" onChange={(e) => setReqArea(e.target.value)}>
								{areas_db.map((elem, index) => {
									return (
										<option id={elem.id} key={index}>{elem.name}</option>
									)
								})}
							</select>
						</div>
						<button className="request-form__btn" type="button" onClick={reqData}>Поиск</button>
					</form>
				</div>

				{dataTable.length !== 0 ? <div className="search-box">
					 <form className="search-form">
						<input className="search-form__input" type="text" placeholder="Поиск по таблице..." onKeyUp={tableSearch}/>
					</form>
				</div> : null}
				<div className="table-box">
					{dataTable.length !== 0 ? <table className="table" id="table">
						<thead>
							<tr className="table-head">
								<th id="0" className="table-head__elem">№</th>
								<th id="1" className="table-head__elem">Вакансия</th>
								<th id="2" className="table-head__elem">Зарплата</th>
								<th id="3" className="table-head__elem" onClick={(e) => sortColumn(e.currentTarget.id)}>Направление</th>
								<th id="4" className="table-head__elem">Работодатель</th>
								<th id="5" className="table-head__elem" onClick={(e) => sortColumn(e.currentTarget.id)}>Адрес</th>
								<th id="6" className="table-head__elem">Занятость</th>
								<th id="7" className="table-head__elem" onClick={(e) => sortColumn(e.currentTarget.id)}>Опыт</th>
								<th id="8" className="table-head__elem">Дата публикации</th>
							</tr>
						</thead>

						<tbody> 
							{dataTable.map((elem, index) => {
								return (
									<tr className="table-body" key={index}>
										<td className="table-body__elem">{index+1}</td>
										<td className="table-body__elem"><a href={elem.alternate_url} target="_blank">{elem.name}</a></td>
										<td className="table-body__elem">{elem.salary === null ? "не указано" : (elem.salary.from === elem.salary.to ? elem.salary.from : (elem.salary.from !== null & elem.salary.to !== null ? elem.salary.from + " - " + elem.salary.to : (elem.salary.from === null ? elem.salary.to : elem.salary.from)))} {elem.salary !== null ? elem.salary.currency : null}</td>
										<td className="table-body__elem">{elem.area.name}</td>
										<td className="table-body__elem"><a href={elem.employer.alternate_url} target="_blank">{elem.employer.name}</a></td>
										<td className="table-body__elem">{elem.address === null ? "не указан" : elem.address.city}</td>
										<td className="table-body__elem">{elem.employment.name}</td>
										<td className="table-body__elem">{elem.experience.name}</td>
										<td className="table-body__elem">{elem.published_at.split('T')[0].replace(/^(\d+)-(\d+)-(\d+)$/, `$3.$2.$1`)}</td>
									</tr>
								)		
							})}
						</tbody>
					</table> : null}
				</div>
			</main>
		</div>
    )
}

export default HomePage;