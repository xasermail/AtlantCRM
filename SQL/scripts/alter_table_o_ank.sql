-- Анкета
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_ANK_ID'
)
begin
	create sequence dbo.SQ_O_ANK_ID start with 1 increment by 1 no cache;
end;

GO

begin
	select * into dbo.O_ANK_TEMP from dbo.O_ANK;
	--drop table O_ANK;

	--insert into dbo.O_ANK select * from dbo.O_ANK_TEMP;
	--drop table dbo.O_ANK_TEMP;
end;

GO

--GO
	--select max(ID)+1 from O_ANK;
--GO
--ALTER SEQUENCE [dbo].[SQ_O_ANK_ID] RESTART WITH 4095 

--GO

if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_ANK'
)
begin
  create table dbo.O_ANK (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_ANK_ID,
    SURNAME varchar(500), -- фамилия
    NAME varchar(500), -- имя
    SECNAME varchar(500), -- отчество
    SEX smallint,    -- пол, M_SEX.ID - 1 - мужской, 2 - женский
    BIRTHDAY smalldatetime,  -- дата рождения
    PHONE_MOBILE varchar(50),  -- мобильный телефон
    PHONE_HOME varchar(50),  -- домашний телефон
    REGION varchar(500),  -- Регион
    CITY varchar(500),  -- Город/село
    STREET varchar(500),  -- Улица
    HOUSE varchar(50),  -- Дом
    FLAT varchar(50),  -- Квартира
    CORPUS varchar(50),  -- Корпус
    DISTRICT varchar(500),  -- Район
    POST_INDEX varchar(50),  -- Почтовый индекс
    IST_INFO smallint, -- Источник информации, M_IST_INFO.ID -- справочник
    FIO_INFO_ID int,   -- Источник информации ФИО, O_ANK.ID - ссылка на анкету, кто пригласил этого человека, когда Источник информации = Посетитель
    USER_REG int,  -- Зарегистрировал(а), ссылка на dbo.S_USER.ID, фактически кто создал анкету, не имеет отношения к регистрации на сеанс
    DATE_REG smalldatetime,  -- Дата регистрации, фактически дата создания анкеты, не имеет отношения к регистрации на сеанс
    PHOTO varbinary(max),  -- Фото клиента
    M_ORG_ID int, -- ссылка на M_ORG.ID, организация, чья это запись
    BONUS int not null default 0, -- есть ли бонус, относится к вкладке Друзья, 1 - есть, 0 - нет
    AKTIVIST int not null default 0, -- является ли активистом (привёл ли кого-то), относится к вкладке Друзья, 1 - активист, 0 - не активист
    GPS_LG decimal(12, 8), -- координаты точки адреса, долгота (longitude)
    GPS_LT decimal(12, 8) -- координаты точки адреса, широта (latitude)
  );
  print('Table O_ANK created');
end;