truncate table dbo.m_zabol;
set identity_insert dbo.m_zabol on;
insert into dbo.m_zabol (id, name) values 
                  ( 1, 'Остеохондроз' ),
                  ( 2, 'Гипертония' ),
                  ( 3,  'Артроз' ),
                  ( 4,  'Профилактика' ),
                  ( 5, 'Сахарный диабет' ),
                  ( 6, 'Варикоз' )
;
set identity_insert dbo.m_zabol off;

GO

truncate table dbo.m_seans_time;
set identity_insert dbo.m_seans_time on;
insert into dbo.m_seans_time (id, name, min_time, max_time, m_org_id)
select 1,  '09:00-09:40', '09:00', '09:40', 2 union all
select 2,  '09:40-10:20', '09:40', '10:20', 2 union all
select 3,  '10:20-11:00', '10:20', '11:00', 2 union all
select 4,  '11:00-11:40', '11:00', '11:40', 2 union all
select 5,  '11:40-12:20', '11:40', '12:20', 2 union all
select 6,  '12:20-13:00', '12:20', '13:00', 2 union all
select 7,  '13:00-13:40', '13:00', '13:40', 2 union all
select 8,  '13:40-14:20', '13:40', '14:20', 2 union all
select 9,  '14:20-15:00', '14:20', '15:00', 2 union all
select 10, '15:00-15:40', '15:00', '15:40', 2 union all
select 11, '15:40-16:20', '15:40', '16:20', 2 union all
select 12, '16:20-17:00', '16:20', '17:00', 2;

set identity_insert dbo.m_seans_time off;

GO

truncate table dbo.m_ryad;
set identity_insert dbo.m_ryad on;
insert into dbo.m_ryad (id, name)
select 1, '1-й ряд' union all
select 2, '2-й ряд'

set identity_insert dbo.m_ryad off;

GO

truncate table dbo.m_ist_inf;
set identity_insert dbo.m_ist_inf on;
insert into dbo.m_ist_inf (id, name)
select 1,  'Сотрудник'     union all
select 2,  'Пригласили'    union all
select 3,  'Сам пришёл'    union all
select 4,  'Посетитель'    union all
select 5,  'Знакомые'      union all
select 6,  'Газета'        union all
select 7,  'Интернет'      union all
select 8,  'Объявление'


set identity_insert dbo.m_ist_inf off;


GO

truncate table dbo.m_sex;
set identity_insert dbo.m_sex on;
insert into dbo.m_sex (id, name)
select 1,  'Мужской'     union all
select 2,  'Женский'


set identity_insert dbo.m_sex off;

GO

truncate table dbo.m_product;
set identity_insert dbo.m_product on;
insert into m_product(id, name)
select 1, 'Проектор' union all
select 2, 'БХМ' union all
select 3, 'МХМ';

set identity_insert dbo.m_product off;

GO

truncate table dbo.m_service_type;
set identity_insert dbo.m_service_type on;
insert into m_service_type(id, name)
select 1, 'Брак' union all
select 2, 'На ремонт' union all
select 3, 'Гарантия' union all
select 4, 'Сделал';

set identity_insert dbo.m_service_type off;

GO

truncate table dbo.s_user_role;
set identity_insert dbo.s_user_role on;
insert into s_user_role(id, name, m_org_id)
select 1 id, 'Стажер', 1 name union all
select 2 id, 'Консультант', 1 name union all
select 3 id, 'Специалист', 1 name union all
select 4 id, 'Управляющий', 1 name union all
select 5 id, 'Директор', 1 name union all
select 6 id, 'Дилер D', 1 name union all
select 7 id, 'Дилер С', 1;

set identity_insert dbo.s_user_role off;

GO

truncate table dbo.m_manual;
set identity_insert dbo.m_manual on;
insert into m_manual(id, name_ru, name_eng)
select 1, 'Группы заболеваний', 'M_ZABOL_GROUP' union all
select 2, 'Группы оборудования', 'M_RYAD' union all
select 3, 'Исключить из отчетов', 'M_PRICH_ISKL' union all
select 4, 'Источники посетителей', 'M_IST_INF' union all
select 5, 'Метод оплаты', 'M_METOD_OPL' union all
select 6, 'Специалисты', 'S_USER_ROLE' union all
select 7, 'Статусы', 'M_STATUS' union all
select 8, 'Статусы сервиса', 'M_SERVICE_TYPE' union all
select 9, 'Статья расхода', 'M_RASHOD_STAT' union all
select 10, 'Типы оборудования', 'M_PRODUCT' union all
select 11, 'Действия', 'M_DEISTV' union all
select 12, 'Вид уведомления', 'M_VID_SOB' union all
select 13, 'Справочник вопросов', 'M_VOPROS' union all
select 14, 'Статус контакта', 'M_KONT_STATUS' union all
select 15, 'Источник контакта', 'M_KONT_IST' union all
select 16, 'Сопровождение - форма оплаты', 'M_SOPR_FORM_OPL' union all
select 17, 'Сопровождение - продукт', 'M_SOPR_PRODUCT' union all
select 18, 'Сопровождение - статусы', 'M_SOPR_STATUS' union all
select 19, 'Сопровождение - доп. услуги', 'M_SOPR_DOP' union all
select 20, 'Тип рассылки СМС', 'M_SMS_TEMPLATE_TYPE';
set identity_insert dbo.m_manual off;

GO


truncate table dbo.m_org;
alter sequence dbo.sq_m_org_id restart;
insert into dbo.m_org(ID, NAME, PARENT_ID, ADRES, PHONE, KOD_PODTV, M_ORG_TYPE_ID)
select (next value for dbo.sq_m_org_id) ID, 'Администрация' NAME, 0 PARENT_ID, 'ул. Какая-то дом 17 корпус 3' ADRES, '938402384' PHONE, '1234' KOD_PODTV, 1 M_ORG_TYPE_ID;


GO

truncate table dbo.m_zabol_group;
insert into dbo.M_ZABOL_GROUP (NAME, M_ORG_ID)
--select 'Опорно-двигательная система' name, 2 m_org_id union all
--select 'Мышечная система' name, 2 m_org_id union all
--select 'Крове-образующая система' name, 2 m_org_id union all
--select 'Лимфатическая система' name, 2 m_org_id union all
--select 'Нервная система' name, 2 m_org_id union all
--select 'Дыхательная система' name, 2 m_org_id union all
--select 'Сердечно-сосудистая система' name, 2 m_org_id union all
--select 'Система пищеварения' name, 2 m_org_id union all
--select 'Мочеполовая система' name, 2 m_org_id union all
--select 'Эндокринная система' name, 2 m_org_id union all
--select 'Система, обеспечивающая иммунитет' name, 2 m_org_id union all
--select 'Система органов чувств' name, 2 m_org_id;
select 'Система органов чувств' name, 2 m_org_id union all
select 'Эндокринная система' name, 2 m_org_id union all
select 'Нервная система' name, 2 m_org_id union all
select 'Дыхательная система' name, 2 m_org_id union all
select 'Сердечно-сосудистая система' name, 2 m_org_id union all
select 'ЖКТ, мочеполовая система' name, 2 m_org_id union all
select 'Детские заболевания' name, 2 m_org_id union all
select 'Прочие заболевания и состояния' name, 2 m_org_id union all
select 'Инфекции, паразиты' name, 2 m_org_id union all
select 'Суставы, кости, мышцы' name, 2 m_org_id union all
select 'Кожные заболевания' name, 2 m_org_id union all
select 'Мужские заболевания' name, 2 m_org_id union all
select 'Женские заболевания' name, 2 m_org_id;

GO

truncate table dbo.m_org_type;
set identity_insert dbo.m_org_type on;
insert into dbo.m_org_type(ID, NAME)
select 1 ID, 'Администрация' NAME union all
select 2 ID, 'Дилер A' NAME union all
select 3 ID, 'Дилер C' NAME union all
select 4 ID, 'Дилер D' NAME union all
select 5 ID, 'Тех. отдел' NAME;

set identity_insert dbo.m_org_type off;

GO

truncate table dbo.M_PRICH_ISKL;
INSERT INTO dbo.M_PRICH_ISKL VALUES (1, 'Нет времени', 1);
INSERT INTO dbo.M_PRICH_ISKL VALUES (2, 'Работаю', 1);
INSERT INTO dbo.M_PRICH_ISKL VALUES (3, 'С внуками', 1);
INSERT INTO dbo.M_PRICH_ISKL VALUES (4, 'Уехали', 1);
INSERT INTO dbo.M_PRICH_ISKL VALUES (5, 'Заболела', 1);
INSERT INTO dbo.M_PRICH_ISKL VALUES (6, 'Обострение', 1);
INSERT INTO dbo.M_PRICH_ISKL VALUES (7, 'Другое', 1);
INSERT INTO dbo.M_PRICH_ISKL VALUES (8, 'Больше не звонить', 1);

GO

truncate table dbo.m_metod_opl;
insert into dbo.m_metod_opl (NAME, M_ORG_ID)
select 'Наличный' name, 2 m_org_id union all
select 'Безналичный' name, 2 m_org_id;

GO

truncate table dbo.m_status;
insert into dbo.m_status (NAME, M_ORG_ID)
select 'Могу купить?' name, 2 m_org_id union all
select 'Потенциальный покупатель' name, 2 m_org_id union all
select 'Ищет возможности' name, 2 m_org_id union all
select 'Кредит' name, 2 m_org_id union all
select 'Рассрочка' name, 2 m_org_id union all
select 'Ожидает оборудования' name, 2 m_org_id union all
select 'Мечтает' name, 2 m_org_id union all
select 'Купил в другом салоне' name, 2 m_org_id union all
select 'Принесет деньги' name, 2 m_org_id union all
select 'Купил' name, 2 m_org_id union all
select 'Предоплата', 2;

GO

truncate table dbo.m_rashod_stat;
insert into dbo.m_rashod_stat (NAME)
select 'Аренда' union all
select 'Зарплата' union all
select 'Интернет' union all
select 'Телефон' union all
select 'Ремонт' union all
select 'Транспорт' union all
select 'Благотворительность' union all
select 'Хозчасть' union all
select 'Обучение' union all
select 'Коммунальные услуги' union all
select 'Командировка' union all
select 'Премия' union all
select 'Рекламная продукция' union all
select 'Канцтовары' union all
select 'Возврат денег' union all
select 'Единый налог' union all
select 'Инкассация';

GO

truncate table dbo.m_pravo_gr;
set identity_insert dbo.m_pravo_gr on;
insert into dbo.m_pravo_gr(id, name)
select 1,	'Личная карта' union
select 2,	'Справочники' union
select 3,	'Регистрация' union
select 4,	'Отчеты' union
select 5,	'Ряды' union
select 6,	'Запись' union
select 7,	'Контакты' union
select 8,	'Учет' union
select 9,	'Приложение' union
select 10, 'Журнал' union
select 11, 'Сопровождение' union
select 12, 'Продление' union
select 13, 'Скрипты';
set identity_insert dbo.m_pravo_gr off;

GO

truncate table dbo.m_pravo_rej;
set identity_insert dbo.m_pravo_rej on;
insert into dbo.m_pravo_rej(id, name, m_pravo_gr_id)
-- Анкета
select	1	,	 'Анкета', 1	union
select	2	,	 'Период', 1	union
select	3	,	 'Общение', 1	union
select	4	,	 'Статистика', 1	union
select	5	,	 'Вопросы', 1	union
select	6	,	 'Выписки', 1	union
select	7	,	 'Друзья', 1	union
select	8	,	 'Звонки', 1	union
select	9	,	 'Сервис', 1	union
-- Отчеты
select	10,	 'Общая статистика', 4	union
select	11,	 'Специалисты', 4	union
select	12,	 'Заболевания', 4	union
select	13,	 'Источники', 4	union
select	14,	 'Дни рождения', 4	union
select	15,	 'Карта', 4	union
select	16,	 'Продажи', 4	union
select	17,	 'Опрос', 4	union
select	18,	 'Сервис', 4	union
select	19,	 'Маркетинговый календарь', 4	union
-- Справочники
select	20,	 '', 2	union
-- Регистрация
select	21,	 '', 3	union
-- Ряды
select	22,	 '', 5	union
-- Запись
select	23,	 '', 6	union
-- Контакты
select	24,	 'Запись', 7	union
-- Склад
select  25,  'Приход на склад', 8 union
select  26,  'Склад', 8 union
select  27,  'Расход со склада', 8 union
select  28,  'Расходные документы', 8 union

-- Учет - отчеты
select  29,  'Отчеты - Список покупателей', 8 union
select  30,  'Отчеты - Дебиторская задолженность', 8 union
select  31,  'Отчеты - Фильтр товаров', 8 union
select  32,  'Отчеты - Отчет о доходах', 8 union
select  33,  'Отчеты - Отчет за период', 8 union

-- Склад
select  34,  'Зарплата', 8 union
select  35,  'Инвентаризация', 8 union

-- Приложение
select	36,	 '', 9	union

-- Журнал
select	37,	 'Действия', 10 union

-- Учет
select  38,  'Проплаты за период', 8 union
select  39,  'Фактические остатки на складе', 8 union
select  40,  'Приход на склад - Себестоимость', 8 union
-- Контакты
select	41,	 'Непришедшие', 7	union
select	42,	 'Скрытые', 7	union
select	43,	 'Рекомендованные', 7 union
-- Отчеты
select	44,	 'День', 4	union
select	45,	 'Метрика', 4 union
select	46	,'Отправка СМС', 1 union
-- Журнал
select	47,	 'Уведомления', 10 union
select	48,	 'Итог', 10 union
-- Под права для уведомлений
select	49,	 'Уведомления - Календарь', 10 union
select	50,	 'Уведомления - Запланированные', 10 union
select	51,	 'Уведомления - Выполненные', 10 union
select	52,	 'Уведомления - Не выполненные', 10 union
-- Отчеты - уведомления
select	53,	 'Уведомление', 4 union
-- Контакты - статистика
select	54,	 'Статистика', 7 union
-- Сопровождение
select  55, 'Сопровождение', 11 union
select  56, 'Продление', 12 union
-- Учет - отчеты
select  57, 'Отчеты - Не продлил', 8 union
select  58, 'Отчеты - Гость', 8 union
-- Скрипты
select 59, 'Аналитика скрипта', 13 union
-- Учет - Не ходят
select  60, 'Отчеты - Не ходят', 8 union
-- Расход со склада - Количество посещений
select 61, 'Расход со скл. - Кол-во посещ.', 8 union
-- Расход со склада - Дата уведомления
select 62, 'Расход со скл. - Дата', 8  union
-- Расход со склада - Дата действия
select 63, 'Расход со скл. - Дата действия', 8
;
set identity_insert dbo.m_pravo_rej off;

GO

truncate table dbo.m_sms_send_error;
set identity_insert dbo.m_sms_send_error on;
insert into dbo.m_sms_send_error(id, name)
select 1,	'Ошибка в параметрах' union
select 2,	'Неверный логин или пароль' union
select 3,	'Недостаточно средств на счете Клиента' union
select 4,	'IP-адрес временно заблокирован из-за частых ошибок в запросах' union
select 5,	'Неверный формат даты' union
select 6,	'Сообщение запрещено (по тексту или по имени отправителя)' union
select 7,	'Неверный формат номера телефона' union
select 8,	'Сообщение на указанный номер не может быть доставлено' union
select 9,	'Отправка более одного одинакового запроса на передачу SMS-сообщения либо более пяти одинаковых запросов на получение стоимости сообщения в течение минуты';
set identity_insert dbo.m_sms_send_error off;

GO

truncate table dbo.m_deistv;
set identity_insert dbo.m_deistv on;
insert into m_deistv(id, name, m_org_id)
select 1, 'Анкета', 1 union all
select 2, 'Общение', 1 union all
select 3, 'Звонки', 1 union all
select 4, 'Запись', 1 union all
select 5, 'Контакты', 1 union all
select 6, 'Учет', 1 union all
select 7, 'Расходы', 1 union all
select 8, 'Выдано', 1 union all
select 9, 'Смена штрих-кода', 1;
set identity_insert dbo.m_deistv off;

GO

truncate table dbo.m_yes_no;
set identity_insert dbo.m_yes_no on;
insert into m_yes_no(id, name)
select 1, 'Да' union all
select 2, 'Нет';
set identity_insert dbo.m_yes_no off;

GO

truncate table dbo.m_vid_sob;
set identity_insert dbo.m_vid_sob on;
insert into m_vid_sob(id, name)
select 1, 'Звонок' union all
select 2, 'Напоминание' union all
select 3, 'Не пришедшие' union all
select 4, 'День рождения' union all
select 5, 'Доплата';
set identity_insert dbo.m_vid_sob off;





GO

truncate table dbo.M_KONT_STATUS;

GO

set identity_insert dbo.M_KONT_STATUS on;
insert into dbo.M_KONT_STATUS (ID, NAME, M_ORG_ID) values (1, '<не задан>', 2), (2, 'Срочно', 2), (3, 'Зв.позже', 2), (4, 'Перезвонить', 2), (5, 'Отказ', 2);
set identity_insert dbo.M_KONT_STATUS off;

GO




GO

truncate table dbo.M_KONT_IST;

GO

set identity_insert dbo.M_KONT_IST on;
insert into dbo.M_KONT_IST (ID, NAME, M_ORG_ID) values (1, '<не задан>', 2), (2, 'Знакомые', 2);
set identity_insert dbo.M_KONT_IST off;

GO

truncate table dbo.M_SOPR_FORM_OPL;
set identity_insert dbo.M_SOPR_FORM_OPL on;
insert into dbo.M_SOPR_FORM_OPL (ID, NAME, M_ORG_ID)
values (1, 'Кредит',    2), 
			 (2, 'Наличка',   2),
			 (3, 'Карточка',  2),
			 (4, 'Рассрочка', 2);  
set identity_insert dbo.M_SOPR_FORM_OPL off;

GO

truncate table dbo.M_SOPR_PRODUCT;
set identity_insert dbo.M_SOPR_PRODUCT on;
insert into dbo.M_SOPR_PRODUCT (ID, NAME, M_ORG_ID)
values (1, '1 мес',  2),
			 (2, '3 мес',  2),
			 (3, '6 мес',  2),
			 (4, '9 мес',  2),
			 (5, '12 мес', 2);
set identity_insert dbo.M_SOPR_PRODUCT off;

GO

truncate table dbo.M_SOPR_STATUS;
set identity_insert dbo.M_SOPR_STATUS on;
insert into dbo.M_SOPR_STATUS (ID, NAME, M_ORG_ID)
values (1,  'Купил',   2),
			 (2,  'Решение', 2),
			 (3,  'Отказ',   2),
			 (4,  'Задача',  2),
			 (5,  'Бронь',   2),
			 (6,  'Цена',    2),
			 (7,  'Сезон',   2),
			 (8,  'Банк',    2),
			 (9,  'Н/П',     2)
set identity_insert dbo.M_SOPR_STATUS off;

GO

truncate table dbo.M_SOPR_DOP;
set identity_insert dbo.M_SOPR_DOP on;
insert into dbo.M_SOPR_DOP (ID, NAME, M_ORG_ID)
values (1,  'Груп.',   2),
			 (2,  'Перс.',  2);
set identity_insert dbo.M_SOPR_DOP off;

GO

truncate table dbo.M_SMS_TEMPLATE_TYPE;
set identity_insert dbo.M_SMS_TEMPLATE_TYPE on;
insert into dbo.M_SMS_TEMPLATE_TYPE (ID, NAME)
values (1, 'День рождения'),
       (2, 'Напоминание за 2 дня до платежа'),
       (3, 'Не ходит более 30 дней (абон)');
set identity_insert dbo.M_SMS_TEMPLATE_TYPE off;

GO