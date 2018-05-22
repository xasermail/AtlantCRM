/* Атлант-CRM - Создание структуры */

--set nocount on;
--set ansi_warnings off;

--GO

--if object_id('tempdb..#temp') is not null drop table #temp;

--GO

------ создание БД
--use master;
--go
--IF NOT EXISTS
--  (
--    select
--      *
--    from
--      sys.databases as d
--    where
--      d.name = 'u468759'      
--  ) 
--begin
--  create table #temp(a int);
--  CREATE DATABASE [u468759] ON  PRIMARY 
--  ( NAME = N'u468759', FILENAME = N'D:\IT-MINDS\BASES\u468759\u468759.mdf' , SIZE = 6072KB , FILEGROWTH = 10240KB )
--   LOG ON 
--  ( NAME = N'u468759_log', FILENAME = N'D:\IT-MINDS\BASES\u468759\u468759_log.ldf' , SIZE = 1024KB , FILEGROWTH = 10%);
  
--end;

--go

--if (object_id('tempdb..#temp') is not null) begin
  
--  ALTER DATABASE [u468759] SET COMPATIBILITY_LEVEL = 100;
--  ALTER DATABASE [u468759] SET ANSI_NULL_DEFAULT OFF;
--  ALTER DATABASE [u468759] SET ANSI_NULLS OFF; 
--  ALTER DATABASE [u468759] SET ANSI_PADDING OFF; 
--  ALTER DATABASE [u468759] SET ANSI_WARNINGS OFF; 
--  ALTER DATABASE [u468759] SET ARITHABORT OFF; 
--  ALTER DATABASE [u468759] SET AUTO_CLOSE OFF; 
--  ALTER DATABASE [u468759] SET AUTO_CREATE_STATISTICS ON; 
--  ALTER DATABASE [u468759] SET AUTO_SHRINK OFF; 
--  ALTER DATABASE [u468759] SET AUTO_UPDATE_STATISTICS ON; 
--  ALTER DATABASE [u468759] SET CURSOR_CLOSE_ON_COMMIT OFF; 
--  ALTER DATABASE [u468759] SET CURSOR_DEFAULT  GLOBAL; 
--  ALTER DATABASE [u468759] SET CONCAT_NULL_YIELDS_NULL OFF; 
--  ALTER DATABASE [u468759] SET NUMERIC_ROUNDABORT OFF; 
--  ALTER DATABASE [u468759] SET QUOTED_IDENTIFIER OFF; 
--  ALTER DATABASE [u468759] SET RECURSIVE_TRIGGERS OFF;
--  ALTER DATABASE [u468759] SET  DISABLE_BROKER WITH ROLLBACK IMMEDIATE; 
--  ALTER DATABASE [u468759] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
--  ALTER DATABASE [u468759] SET DATE_CORRELATION_OPTIMIZATION OFF 
--  ALTER DATABASE [u468759] SET PARAMETERIZATION SIMPLE 
--  ALTER DATABASE [u468759] SET  READ_WRITE 
--  ALTER DATABASE [u468759] SET RECOVERY SIMPLE WITH NO_WAIT
--  ALTER DATABASE [u468759] SET  MULTI_USER 
--  ALTER DATABASE [u468759] SET PAGE_VERIFY CHECKSUM
--  USE [u468759]
--  IF NOT EXISTS (SELECT name FROM sys.filegroups WHERE is_default=1 AND name = N'PRIMARY') ALTER DATABASE [u468759] MODIFY FILEGROUP [PRIMARY] DEFAULT;
--  ALTER DATABASE [u468759] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
--  alter database [u468759] collate Cyrillic_General_CI_AS;
--  ALTER DATABASE [u468759] SET MULTI_USER;
--end;

--GO

--if object_id('tempdb..#temp') is not null drop table #temp;

--GO

--USE [u468759]
GO

-- Анкета
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_ANK_ID'
)
begin
	create sequence dbo.SQ_O_ANK_ID start with 1 increment by 1 no cache;
end;

GO

-- создание O_ANK - анкеты клиентов
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
    GPS_LT decimal(12, 8), -- координаты точки адреса, широта (latitude)
    VIP int not null default 0, -- 1 - VIP-клиент, 0 - нет
    D_SKRYT_PO smalldatetime, -- дата сокрытия записи для Учет - Отчеты - Не ходят
		ID_CODE int not null default 0 -- штрих-код
  );
  print('Table O_ANK created');
end;

GO

-- создание таблицы O_ZVONOK -  актуальная информация о обзвоне
-- Если записи нет в таблице - анкета в списке обзвона, но звонков еще не было
--  если запись есть и  период исключения не закончился - анкета исключена из списка обзвона
-- если период исключения не задан или период исключения закончился -  анкета включена в список обзвона
if not EXISTS (
  SELECT * FROM information_schema.tables as t WHERE t.table_name = 'O_ZVONOK'
)
begin
  CREATE TABLE dbo.O_ZVONOK (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    O_ANK_ID int NOT NULL,
    D_END_ISKL smalldatetime,-- Окончание периода исключения
    M_ISKL_ID int,       -- Причина исключения из справочника M_ISKL
    OPERATOR varchar(100),   -- Пользователь ФИО
    D_MODIF smalldatetime,   -- Дата редактирования
    D_START  smalldatetime,   -- Дата создания
    COMMENT varchar(4000), -- комментарий
    M_ORG_ID int, -- ссылка на M_ORG.ID, организация, чья это запись
	  D_START_USER_ID int, --пользователь создавший запись
    D_MODIF_USER_ID int, --пользователь внесший последние изменения
    D_END_ISKL_USER_ID int --пользователь исключивший
  );
  print('Table O_ZVONOK created');
end;

GO

-- создание cправочника M_SHABLON - пополняемый справочник шаблонов Текстов для обзвона
if not EXISTS (
  SELECT * FROM information_schema.tables as t WHERE t.table_name = 'M_SHABLON'
)
begin
  CREATE TABLE dbo.M_SHABLON (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,    
    SHABLON_NAME varchar(500),  -- Название шаблона
    SHABLON_TEXT varchar(5000),  -- Текст шаблона
    D_CREATE smalldatetime,  -- Дата создания
    OPERATOR varchar(100),  -- Пользователь ФИО
    M_ORG_ID int -- организация пользователя
  );
  print('Table M_SHABLON created');
end;

GO

-- создание справочника M_PRICH_ISKL -  справочник причин исключения пользователя из списка обзвона
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_PRICH_ISKL'
)
begin
  CREATE TABLE dbo.M_PRICH_ISKL (
      ID int NOT NULL PRIMARY KEY,  
      NAME varchar(500),  -- Причина  
      M_ORG_ID int -- организация пользователя
  );
  print('Table M_PRICH_ISKL created');
  
end;

GO

-- создание справочника O_DIALOG - общение с клиентом
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_DIALOG'
)
begin
  CREATE TABLE dbo.O_DIALOG (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    O_ANK_ID int, -- ссылка на анкету
    COMMENT varchar(4000),  -- комментарий
    USERID int, -- сотрудник
    M_ORG_ID int, -- организация сотрудника
    NPOS varchar(100), -- дата,время и фио сотрудника в строке, для вывода в таблицу
    DIALOG_DATE smalldatetime, -- для анализа, чтобы не парсить npos
    O_SEANS_ID int -- ссылка на текущий сеанс
  );
  print('Table O_DIALOG created');
end;

GO

-- создание справочника O_STATUS - статусы покупок клиента
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_STATUS'
)
begin
  CREATE TABLE dbo.O_STATUS (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    O_ANK_ID int, -- ссылка на анкету
    M_STATUS_ID int,   -- ссылка на справочник статусов M_STATUS.ID
    M_PRODUCT_ID int,  -- ссылка на товар M_PRODUCT.ID
    STATUS_DATE smalldatetime,  -- дата статуса
    USERID int, -- сотрудник
    M_ORG_ID int -- организация сотрудника
  );
  print('Table O_STATUS created');
end;

GO

-- заболевания выбранные в анкете
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_ANK_ZABOL'
)
begin
  CREATE TABLE dbo.O_ANK_ZABOL (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    O_ANK_ID int, -- ссылка на анкету
    M_ZABOL_ID int, -- заболевание из справочника M_ZABOL
    M_ORG_ID int -- организация сотрудника
  );
  print('Table O_ANK_ZABOL created');
end;

GO

-- расписание сеансов
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_SEANS_TIME'
)
begin
  CREATE TABLE dbo.M_SEANS_TIME (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(100), -- время в строковом виде, напр. 09:00 - 09:40
    MIN_TIME varchar(50), -- время в строковом виде, напр. 09:00
    MAX_TIME varchar(50), -- время в строковом виде, напр. 09:40
    M_ORG_ID int, -- организация пользователя
    MIN_TIME_MINUTES as cast(substring(MIN_TIME, 1, 2) as int) * 60 + cast(substring(MIN_TIME, 4, 2) as int), -- минимальное время переведенное в минутах
    MAX_TIME_MINUTES as cast(substring(MAX_TIME, 1, 2) as int) * 60 + cast(substring(MAX_TIME, 4, 2) as int) -- максимальное время переведенное в минутах
    
  );
  print('Table M_SEANS_TIME created');
end;

GO

-- места на сеансе (ковер, оборудование и т.д.)
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_SEANS_PLACE'
)
begin
  CREATE TABLE dbo.M_SEANS_PLACE (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(100), -- наименование места
    M_PRODUCT_ID int, -- M_PRODUCT.ID тип оборудования
    M_RYAD_ID int, -- M_RYAD.ID группа оборудования, логичней, конечно, номер ряда, но так называется на макете
    M_ORG_ID int -- организация пользователя
  );
  print('Table M_SEANS_PLACE created');
end;

GO

-- регистрация на сеанс
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_SEANS'
)
begin
  CREATE TABLE dbo.O_SEANS (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    O_ANK_ID int, -- ссылка на анкету
    M_SEANS_TIME_ID int, -- ссылка на время сеанса M_SEANS_TIME.ID
    M_SEANS_PLACE_ID int, -- ссылка на место сеанса M_SEANS_PLACE.ID
    SEANS_DATE smalldatetime, -- дата, на которую записались, без времени, время должно быть 00:00
    SEANS_STATE int NOT NULL default 0, -- SEANS_STATE: 0 - записался на сеанс, 1 - сеанс состоялся
    M_RYAD_ID int, -- cсылка на M_RYAD.ID - ссылка на справочник рядов
    USERID int, -- сотрудник, создавший запись на сеанс
    D_START smalldatetime, -- дата создания записи
    LANE int, -- 1 - записан из рядов
    USERID_REG int, -- сотрудник, выполнивший регистрацию
    D_REG smalldatetime, -- дата регистрации
    BEZ_REG int not null default 0, -- 1 - не зарегистрирован
    M_ORG_ID int, -- ссылка на M_ORG.ID, организация, чья это запись
    ANK int not null default 0, -- 1 - зарегистрирован из анкеты
    D_MODIF smalldatetime, -- дата редактирования записи, например меняется, когда регистрируют предварительно записанного человека
    IS_FIRST_KONT_SEANS int not null default 0, -- ставится 1, когда создаётся анкета на существующий контакт и при создании анкеты происходит регистрация на сеанс (первый сеанс контакта)
    FROM_ZVONOK int not null default 0, -- 1, если сеанс создан из режима Звонки
    IS_GOST int not null default 0 -- 1, если это гость (посетитель из другого салона)
  );
  print('Table O_SEANS created');
end;

GO

-- комментарий для сеанса (на самом деле комментарий к рядам)
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_SEANS_COMMENT'
)
begin
  CREATE TABLE dbo.O_SEANS_COMMENT (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    SEANS_DATE smalldatetime, -- дата регистрации
    COMMENT varchar(4000),  -- комментарий
    USERID int -- сотрудник
  );
  print('Table O_SEANS_COMMENT created');
end;

GO

-- справочник фамилий
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_SURNAME'
)
begin
  CREATE TABLE dbo.M_SURNAME (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    SURNAME varchar(100)
  );
  print('Table M_SURNAME created');
end;

GO

-- справочник имён и пола
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_NAME_AND_SEX'
)
begin
  CREATE TABLE dbo.M_NAME_AND_SEX (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(100),
    SEX int
  );
  print('Table M_NAME_AND_SEX created');
end;

GO

-- справочник отчеств
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_SECNAME'
)
begin
  CREATE TABLE dbo.M_SECNAME (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    SECNAME varchar(100)
  );
  print('Table M_SECNAME created');
end;

GO

-- создание таблицы O_COMPLAINT - содержит "Что беспокоит больше всего?" из общения
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_COMPLAINT'
)
begin
  CREATE TABLE dbo.O_COMPLAINT (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    O_ANK_ID int, -- ссылка на анкету
    COMMENT varchar(4000),  -- Жалобы
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- пользователь который вввел данные
    M_ORG_ID int -- организация пользователя
  );
  print('Table O_COMPLAINT created');
end;

GO

-- справочник заболеваний
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_ZABOL'
)
begin
  CREATE TABLE dbo.M_ZABOL (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500),
    M_ZABOL_GROUP_ID int,
    M_ORG_ID int -- организация пользователя
  );
  print('Table M_ZABOL created');
end;

GO

-- справочник рядов
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_RYAD'
)
begin
  CREATE TABLE dbo.M_RYAD (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500)--,
    --M_ORG_ID int -- организация пользователя -- не нужно
  );
  print('Table M_RYAD created');
end;

GO

-- Источник информации (Сотрудник, Пригласили, Сам пришёл и т.д.)
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_IST_INF'
)
begin
  CREATE TABLE dbo.M_IST_INF (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(100), -- наименование источника
    M_ORG_ID int -- организация пользователя
  );
  print('Table M_IST_INF created');
end;

GO

if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_SERVICE'
)
begin
  CREATE TABLE dbo.O_SERVICE (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    O_ANK_ID int, -- ссылка на анкету O_ANK.ID 
    M_SERVICE_TYPE_ID int, -- ссылка на тип сервиса M_SERVICE_TYPE.ID  
    M_PRODUCT_ID int, -- ссылка на тип товара M_PRODUCT.ID
    SERIAL_NUMBER varchar(100), -- серийный номер товара, проданного клиенту
    PRODUCT_PHOTO varbinary(max), -- фото принятого в сервис товара
    GUARANTEE_PHOTO varbinary(max), -- фото гарантийного листа товара
    PRODUCT_CHECK varbinary(max),  -- товарный чек
    COMMENT varchar(4000), -- комментарий
    USERID int, -- сотрудник
    D_START smalldatetime, -- дата создания записи
    M_ORG_ID int,	-- организация 
		D_MODIF smalldatetime,
		M_SERVICE_TYPE_ID_TEH_OTDEL int, -- ссылка на тип сервиса, указывается в техотделе M_SERVICE_TYPE.ID
		DATE_TEH_OTDEL smalldatetime,	-- дата вероятной готовности, указывается в техотделе
		S_USER_ID_TEH_OTDEL int,	-- сотрудник техотдела
		COMMENT_TEH_OTDEL varchar(4000),	-- комментарий техотдела
		M_ORG_ID_TEH_OTDEL int -- организация техотдела
  );
  print('Table O_SERVICE created');
end;

GO

-- справочник товаров, продукции, Типы оборудования
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_PRODUCT'
)
begin
  CREATE TABLE dbo.M_PRODUCT (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500),
    M_ORG_ID int, -- организация пользователя
		IS_ABON int not null default 0
  );
  print('Table M_PRODUCT created');
end;

GO

-- справочник статусов ремонта
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_SERVICE_TYPE'
)
begin
  CREATE TABLE dbo.M_SERVICE_TYPE (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500),
    M_ORG_ID int -- организация пользователя
  );
  print('Table M_SERVICE_TYPE created');
end;

GO


-- Пол (мужской, женский)
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_SEX'
)
begin
  CREATE TABLE dbo.M_SEX (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(100) -- наименование пола
  );
  print('Table M_SEX created');
end;

GO

-- Пользовательские роли
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'S_USER_ROLE'
)
begin
  CREATE TABLE dbo.S_USER_ROLE (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500), -- наименование роли
    M_ORG_ID int -- организация пользователя
  );
  print('Table S_USER_ROLE created');
end;

GO

if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_S_USER_ID'
)
begin
	create sequence dbo.SQ_S_USER_ID start with 1 increment by 1 no cache;
end;

GO

-- Сотрудники
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'S_USER'
)
begin
  CREATE TABLE dbo.S_USER (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_S_USER_ID,
    S_USER_ROLE_ID int NOT NULL,
    SURNAME varchar(500), -- фамилия cотрудника
    NAME varchar(500), -- имя сотрудника
    SECNAME varchar(500), -- отчество сотрудника
    M_ORG_ID int, -- организация пользователя
    AspNetUsersId nvarchar(128), -- ссылка на dbo.AspNetUsers.Id
    PHOTO varbinary(max),  -- фото пользователя
    D_START smalldatetime,
    BIRTHDAY smalldatetime, -- день рождения сотрудника
    HIRE_DATE smalldatetime, -- дата приёма на работу
    IS_ADM int not null default 0, -- 1, если относится к администрации, это суперпользователь, который может заходить под любой организацией
    SIP_LOGIN varchar(500), -- логин для звонков
    SIP_PASSWORD varchar(500), -- пароль для звонков
    PHONE_MOBILE varchar(50),  -- мобильный телефон пользователя
    DISMISS_DATE smalldatetime, -- дата увольнения
    IS_DILER_A int not null default 0, -- 1, если относится к Дилеру А
    IS_DILER_C int not null default 0, -- 1, если относится к Дилеру С
    M_ORG_ID_DILER_A int, -- M_ORG_ID, для возвращения Дилеру А "своей" организация, при возврате из салона 
    M_ORG_ID_DILER_C int  -- M_ORG_ID, для возвращения Дилеру С "своей" организация, при возврате из салона
  );
  print('Table S_USER created');
end;

GO

-- Журнал времени входа сотрудника в систему
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'S_USER_SIGN_LOG'
)
begin
  CREATE TABLE dbo.S_USER_SIGN_LOG (
    ID int NOT NULL PRIMARY KEY identity,
    S_USER_ID int NOT NULL,
    D_SIGN smalldatetime -- дата входа в систему, учитывается 1 раз за день
  );
  print('Table S_USER_SIGN_LOG created');
end;

GO

-- Справочник для вывода в combobox наименований наполняемых справочников
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_MANUAL'
)
begin
  CREATE TABLE dbo.M_MANUAL (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME_ENG varchar(500), -- наименование на английском языке, как в БД
    NAME_RU varchar(500) -- наименование на русском языке, для отображения пользователю
  );
  print('Table M_MANUAL created');
end;

GO

-- Справочник типов Организаций
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_ORG_TYPE'
)
begin
  CREATE TABLE dbo.M_ORG_TYPE (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500) -- наименование типа организации, например "Дилер A"
  );
  print('Table M_ORG_TYPE created');
end;

GO

if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_M_ORG_ID'
)
begin
	create sequence dbo.SQ_M_ORG_ID start with 1 increment by 1 no cache;
end;

GO

-- Организации
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_ORG'
)
begin
  CREATE TABLE dbo.M_ORG (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_M_ORG_ID,
    NAME varchar(500), -- наименование организации
    PARENT_ID int NOT NULL, -- ссылка на dbo.M_ORG.ID родительской организации
    ADRES varchar(500), -- адрес
    PHONE varchar(500), -- телефон
    KOD_PODTV varchar(500), -- код подтверждения
    M_ORG_TYPE_ID int, -- ссылка на dbo.M_ORG_TYPE.ID
    TZ int, -- часовой пояс, в котором работает организация
    M_ORG_ID_TEH_OTDEL int, -- тех. отдел, к которому относится организация, ссылка на dbo.M_ORG.ID, где M_ORG_TYPE_ID = 5
		DEISTV int not null default 1
  );
  print('Table M_ORG created');
end;

GO

-- Справочник Группы прав
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_PRAVO_GR'
)
begin
  CREATE TABLE dbo.M_PRAVO_GR (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500) -- наименование группы
  );
  print('Table M_PRAVO_GR created');
end;

GO

-- Справочник Права на режим
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_PRAVO_REJ'
)
begin
  CREATE TABLE dbo.M_PRAVO_REJ (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500), -- наименование группы
    M_PRAVO_GR_ID int -- ссылка на M_PRAVO_GR.ID
  );
  print('Table M_PRAVO_REJ created');
end;

GO

-- Справочник групп заболеваний
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_ZABOL_GROUP'
)
begin
  CREATE TABLE dbo.M_ZABOL_GROUP (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500), -- наименование группы
    M_ORG_ID int -- организация пользователя
  );
  print('Table M_ZABOL_GROUP created');
end;

GO

-- Группы прав доступные организации
-- если право есть в таблице, значит оно доступно организации
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_PRAVO_GR'
)
begin
  CREATE TABLE dbo.O_PRAVO_GR (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    S_USER_ID int, -- ссылка на S_USER.ID
    M_PRAVO_GR_ID int -- ссылка на M_PRAVO_GR.ID
  );
  print('Table O_PRAVO_GR created');
end;

GO

-- Права на режим доступные организации
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_PRAVO_REJ'
)
begin
  CREATE TABLE dbo.O_PRAVO_REJ (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    S_USER_ID int, -- ссылка на S_USER.ID
    M_PRAVO_REJ_ID int, -- ссылка на M_PRAVO_REJ.ID,
    READ1 int, -- 1 - доступно право на чтение
    WRITE1 int -- 1 - доступно право на запись
  );
  print('Table O_PRAVO_REJ created');
end;

GO

-- Справочник метод оплаты
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_METOD_OPL'
)
begin
  CREATE TABLE dbo.M_METOD_OPL (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500), -- наименование
    M_ORG_ID int -- организация пользователя
  );
  print('Table M_METOD_OPL created');
end;

GO

-- Справочник статусы
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_STATUS'
)
begin
  CREATE TABLE dbo.M_STATUS (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500), -- наименование
    M_ORG_ID int -- организация пользователя
  );
  print('Table M_STATUS created');
end;

GO

-- Справочник статья расхода
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_RASHOD_STAT'
)
begin
  CREATE TABLE dbo.M_RASHOD_STAT (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500), -- наименование
    M_ORG_ID int -- организация пользователя
  );
  print('Table M_RASHOD_STAT created');
end;

GO

-- Справочник рабочих дней
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_WORK_DAY'
)
begin
  CREATE TABLE dbo.M_WORK_DAY (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    DAY_ID int,  -- нумерация дня недели по javascript - {0-воскресенье, 1-понедельник...6-суббота}
    NAME varchar(500), -- наименование
    M_ORG_ID int -- организация пользователя
  );
  print('Table M_WORK_DAY created');
end;

GO

-- анкеты для режима контакты
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_KONT_ANK'
)
begin
  create table dbo.O_KONT_ANK (
    ID int identity(1,1) primary key,
    SURNAME varchar(500), -- фамилия
    [NAME] varchar(500), -- имя
    SECNAME varchar(500), -- отчество
    PHONE varchar(50), -- телефон
    M_ORG_ID int, -- организация
    USERID int, -- пользователь который вввел данные
    SKR int not null default 0, -- признак скрытой анкеты; 0 - не скрыта, 1 - скрыта пользователем, 2 - скрыта при создании настоящей анкеты
	  D_START smalldatetime, -- дата создания контакта
	  O_ANK_ID int,	-- идентификатор созданной анкеты dbo.O_ANK.ID
    M_KONT_STATUS_ID int not null default 1, -- статус контакта, ссылка на dbo.M_KONT_STATUS.ID
    M_KONT_IST_ID int not null default 1, -- источник контакта, ссылка на dbo.M_KONT_IST.ID
    SKR_IZ_RECORD int not null default 0, -- признак того, что Контакт скрыт из общего режима Запись
    SOZD_NEPR int not null default 0 -- признак того, что Не пришедший создан через интерфейс, признак снимается, если Не пришедшему после добавления будет проставлена дата сеанса, это нужно, чтобы он пропал со вкладки Не пришедшие
  );
  print('Table O_KONT_ANK created');
end;

GO

-- сеансы для режима контакты
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_KONT_SEANS'
)
begin
  create table dbo.O_KONT_SEANS (
      ID int identity(1,1) primary key,
      O_KONT_ANK_ID int, --анкета для режима контакты
      COMMENT varchar(max), --коментарий
      D_ZV smalldatetime, --дата звонка
      SEANS_DATE smalldatetime, --дата сеанса на которую назначена встреча, может быть null, если контакт создан в Не пришедших из интерфейса
      M_SEANS_TIME_ID int, --идентификатор времени сеанса, может быть null, если контакт создан в Не пришедших из интерфейса
      M_ORG_ID int, --организация
      USERID int --пользователь который вввел данные
  );
  print('Table O_KONT_SEANS created');
end;

GO

-- анкеты для режима Контакты, вкладка Рекомендованные
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_REK_ANK'
)
begin
  create table dbo.O_REK_ANK (
    ID int identity(1,1) primary key,
    SURNAME varchar(500), -- фамилия
    [NAME] varchar(500), -- имя
    SECNAME varchar(500), -- отчество
    PHONE varchar(50), -- телефон
    M_ORG_ID int, -- организация
    USERID int, -- пользователь который вввел данные
	  D_START smalldatetime, -- дата создания контакта
	  O_ANK_ID int,	-- идентификатор созданной анкеты dbo.O_ANK.ID
	  SKR int not null default 0,  -- признак скрытой анкеты; 0 - не скрыта, 1 - скрыта пользователем, 2 - скрыта при создании настоящей анкеты
    O_ANK_ID_REK int -- человек, который его рекомендовал, ссылка на dbo.O_ANK.ID
  );
  print('Table O_REK_ANK created');
end;

GO

if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_SKLAD_PR_ID'
)
begin
	create sequence dbo.SQ_O_SKLAD_PR_ID start with 1 increment by 1 no cache;
end;

GO

-- Склад - приход, приходная накладная
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_SKLAD_PR'
)
begin
  CREATE TABLE dbo.O_SKLAD_PR (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_SKLAD_PR_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- пользователь который вввел данные
    M_ORG_ID int, -- организация пользователя
    D_SCHET smalldatetime, -- дата счета
    N_SCHET varchar(500) -- счет (номер счета)
  );
  print('Table O_SKLAD_PR created');
end;

GO

if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_SKLAD_PR_PRODUCT_ID'
)
begin
	create sequence dbo.SQ_O_SKLAD_PR_PRODUCT_ID start with 1 increment by 1 no cache;
end;

GO

-- Склад - приход, оборудование, продукция
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_SKLAD_PR_PRODUCT'
)
begin
  CREATE TABLE dbo.O_SKLAD_PR_PRODUCT (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_SKLAD_PR_PRODUCT_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- пользователь который вввел данные
    M_ORG_ID int, -- организация пользователя
    O_SKLAD_PR_ID int, -- ссылка на dbo.O_SKLAD_PR.ID
    M_PRODUCT_ID int,  -- ссылка на товар M_PRODUCT.ID  
    KOLVO int, -- количество продукции
    COST decimal(18, 2) -- стоимость
  );
  print('Table O_SKLAD_PR_PRODUCT created');
end;

GO

if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_SKLAD_RAS_ID'
)
begin
	create sequence dbo.SQ_O_SKLAD_RAS_ID start with 1 increment by 1 no cache;
end;

GO

-- Склад - расход, расходная накладная
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_SKLAD_RAS'
)
begin
  CREATE TABLE dbo.O_SKLAD_RAS (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_SKLAD_RAS_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- пользователь который вввел данные
    M_ORG_ID int, -- организация пользователя
    D_SCHET smalldatetime, -- дата счета
    N_SCHET varchar(500), -- счет (номер счета)
    SURNAME varchar(500), -- фамилия, пусто, если O_ANK_ID is not null
    NAME varchar(500), -- имя, пусто, если O_ANK_ID is not null
    SECNAME varchar(500), -- отчество, пусто, если O_ANK_ID is not null
    STREET varchar(500),  -- Улица, пусто, если O_ANK_ID is not null
    POST_INDEX varchar(50),  -- Почтовый индекс, пусто, если O_ANK_ID is not null
    PHONE_MOBILE varchar(50),  -- мобильный телефон, пусто, если O_ANK_ID is not null
    O_ANK_ID int, -- ссылка на dbo.O_ANK.ID
    S_USER_ID int, -- ссылка на dbo.S_USER.ID, сотрудник (осуществивший расход)
    SEMYA_VSEGO int, -- сколько членов семьи с вами проживают
    HODIT int -- ходит
  );
  print('Table O_SKLAD_RAS created');
end;

GO

if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_SKLAD_RAS_PRODUCT_ID'
)
begin
	create sequence dbo.SQ_O_SKLAD_RAS_PRODUCT_ID start with 1 increment by 1 no cache;
end;

GO

-- Склад - расход, оборудование, продукция
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_SKLAD_RAS_PRODUCT'
)
begin
  CREATE TABLE dbo.O_SKLAD_RAS_PRODUCT (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_SKLAD_RAS_PRODUCT_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- пользователь который вввел данные
    M_ORG_ID int, -- организация пользователя
    O_SKLAD_RAS_ID int, -- ссылка на dbo.O_SKLAD_RAS.ID
    M_PRODUCT_ID int,  -- ссылка на товар M_PRODUCT.ID  
    KOLVO int, -- количество продукции
    TSENA decimal(18, 2), -- цена
    SKIDKA decimal(5, 3), -- скидка в процентах
    COST decimal(18, 2), -- стоимость
    IS_AKTSIYA int not null default 0, -- 1 - если акция
    OPL_VSEGO decimal(18,2), -- сколько оплатили
    OPL_OST decimal(18,2), -- остаточная стоимость (осталось оплатить)
    IS_VID int not null default 0, -- 1 - если выдано
    D_VID smalldatetime, -- дата выдачи
		IS_ABON int not null default 0, -- 1 - товар является абонементом
		D_DEISTV smalldatetime, -- дата действия
    /* дата приостановки абонемента перенесена в таблицу dbo.O_ABON_PRIOST */
    KOLVO_POS int -- количество посещений, для абонемента с посещениями
  );
  print('Table O_SKLAD_RAS_PRODUCT created');
end;

GO

if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_SKLAD_RAS_PRODUCT_OPL_ID'
)
begin
	create sequence dbo.SQ_O_SKLAD_RAS_PRODUCT_OPL_ID start with 1 increment by 1 no cache;
end;

GO

-- Склад - оплата расхода, внесенные клиентом платежи за купленную продукцию
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_SKLAD_RAS_PRODUCT_OPL'
)
begin
  CREATE TABLE dbo.O_SKLAD_RAS_PRODUCT_OPL (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_SKLAD_RAS_PRODUCT_OPL_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- пользователь который вввел данные
    M_ORG_ID int, -- организация пользователя
    O_SKLAD_RAS_PRODUCT_ID int, -- ссылка на dbo.O_SKLAD_RAS_PRODUCT.ID
    OPL decimal(18,2), -- частичная оплата (сколько оплатили)
    D_OPL smalldatetime, -- дата оплаты (дата частичной оплаты)
    M_METOD_OPL_ID int, -- ссылка на M_METOD_OPL.ID, метод оплаты
    SERIAL varchar(500) -- серийный номер
  );
  print('Table O_SKLAD_RAS_PRODUCT_OPL created');
end;

GO

-- Склад - оплата расхода, внесенные клиентом платежи за купленную продукцию
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_RAS_DOK'
)
begin
  CREATE TABLE dbo.O_RAS_DOK (
    ID int NOT NULL PRIMARY KEY IDENTITY(1,1),
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- пользователь который вввел данные
    M_ORG_ID int, -- организация пользователя
    M_RASHOD_STAT_ID int, -- статья расхода - M_RASHOD_STAT.ID
    D_SCHET smalldatetime, -- дата счета
    N_SCHET varchar(500), -- счет (номер счета)
    POSTAV_NAME varchar(500), -- наименование поставщика
    REK varchar(4000), -- реквизиты
    COST decimal(18, 2), -- цена
    KOLVO int, -- количество
    SUMMA_RASH decimal(18, 2), -- сумма, которая по факту была израсходована
    S_USER_ID int, -- пользователь, которому была выдана сумма
    MOTIV varchar(4000), -- мотив
		SUMMA_VID  decimal(18, 2), -- сумма, которая была выдана
		VOZVR decimal(18, 2), -- сумма, которая была возвращена
		RASHOD decimal(18, 2)	-- израсходовано по факту - подотчетный расход
  );
  print('Table O_RAS_DOK created');
end;

GO


GO

-- Отчет Дни рождения, отметки о совершенных звонках 
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_REPORT_BIRTHDAY_CALL'
)
begin
  CREATE TABLE dbo.O_REPORT_BIRTHDAY_CALL (
    ID int identity NOT NULL primary key,
    D_START smalldatetime,
    USERID int, -- пользователь который вввел данные
    M_ORG_ID int, -- организация пользователя
    O_ANK_ID int -- ссылка на анкету O_ANK.ID 
  );
  print('Table O_REPORT_BIRTHDAY_CALL created');
end;

if TYPE_ID(N'ID_LIST') is null
begin
	create type ID_LIST
	as table
	(
		ID int
	);
end;

GO

-- Календарь продаж
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_KALEN_PROD_ID'
)
begin
	create sequence dbo.SQ_O_KALEN_PROD_ID start with 1 increment by 1 no cache;
end;

GO

-- Календарь продаж, задаваемый дилером A
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_KALEN_PROD'
)
begin
  CREATE TABLE dbo.O_KALEN_PROD (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_KALEN_PROD_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- пользователь который вввел данные
    M_ORG_ID int, -- организация пользователя
    GOD int, -- год, на который составляется календарь продаж
    MES int, -- месяц, на который составляется календарь продаж
    NAME_AK varchar(500), -- наименование акции
    M_PRODUCT_ID_TOVAR int, -- товар, ссылка на dbo.M_PRODUCT.ID
    M_PRODUCT_ID_PODAROK int, -- подарок, ссылка на dbo.M_PRODUCT.ID
    COST decimal(18, 2), -- цена
    D_NAPOLN_S smalldatetime, -- период Наполняем с
    D_NAPOLN_PO smalldatetime, -- период Наполняем по
    D_VLYUB_S smalldatetime, -- период Влюбляем с
    D_VLYUB_PO smalldatetime, -- период Влюбляем по
    D_PROD_S smalldatetime, -- период Продаём с
    D_PROD_PO smalldatetime, -- период Продаём по
    D_PERIOD_S as D_NAPOLN_S, -- начала отчетного периода (вычисляемое поле для удобства)
    D_PERIOD_PO as D_PROD_PO -- конец отчетного периода (вычисляемое поле для удобства)
  );
  print('Table O_KALEN_PROD created');
end;

GO

-- Учёт - Зарплата
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_ZARPL_ID'
)
begin
	create sequence dbo.SQ_O_ZARPL_ID start with 1 increment by 1 no cache;
end;

GO

-- Учёт - Зарплата
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_ZARPL'
)
begin
  CREATE TABLE dbo.O_ZARPL (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_ZARPL_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- пользователь который ввел данные
    M_ORG_ID int, -- организация пользователя
    D_PERIOD_S smalldatetime, -- период с
    D_PERIOD_PO smalldatetime -- период по
  );
  print('Table O_ZARPL created');
end;

GO

-- Учёт - Зарплата - Сотрудники
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_ZARPL_FIO_ID'
)
begin
	create sequence dbo.SQ_O_ZARPL_FIO_ID start with 1 increment by 1 no cache;
end;

GO

-- Учёт - Зарплата - Сотрудники
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_ZARPL_FIO'
)
begin
  CREATE TABLE dbo.O_ZARPL_FIO (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_ZARPL_FIO_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- пользователь который вввел данные
    M_ORG_ID int, -- организация пользователя
    S_USER_ID int, -- сотрудник, для которого зарплата
    O_ZARPL_ID int, -- ссылка на dbo.O_ZARPL.ID
    DNI int, -- количество отработанных дней
    CHAS int, -- количество отработанных часов
    S_CH decimal(18, 2), -- зарплата в час (автоматически рассчитывается)
    SUMMA decimal(18, 2), -- сумма оплаты за день
    VALOV_DOHOD decimal(18, 2), -- валовой, сколько сотрудником было продано товара за период
    PROTS decimal(18, 2), -- процент от валовой, который пойдёт в зарплату
    BONUS decimal(18, 2), -- бонус, начисляется директором
    SHTRAF decimal(18, 2), -- штраф, начисляется директором
    ZARPL decimal(18, 2) -- итоговая зарплата
  );
  print('Table O_ZARPL_FIO created');
end;

GO

-- Учёт - Инвентаризация
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_INVENT'
)
begin
  CREATE TABLE dbo.O_INVENT (
    ID int NOT NULL PRIMARY KEY identity(1,1),
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- пользователь который вввел данные
    M_ORG_ID int, -- организация пользователя
    NAME varchar(500), -- название
    KOLVO int,	-- количество
    COST decimal(18, 2), -- стоимость
    INV_NUM varchar(500), -- инвентарный номер
    IS_SPISAN int default 0,	-- 0 - числится, 1 - списан
    COMMENT varchar(4000), -- комментарий
    PHOTO varbinary(max), -- фото инвентарной единицы
    CHECK_PHOTO varbinary(max) -- фото чека покупки инвентарной единицы
  );
  print('Table O_INVENT created');
end;

GO

-- Дилер A - склад
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_DILER_A_SKLAD_ID'
)
begin
	create sequence dbo.SQ_O_DILER_A_SKLAD_ID start with 1 increment by 1 no cache;
end;

GO

-- Дилер A - склад
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_DILER_A_SKLAD'
)
begin
  CREATE TABLE dbo.O_DILER_A_SKLAD (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_DILER_A_SKLAD_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- пользователь который вввел данные
    M_ORG_ID int, -- дилер A, ссылка на dbo.M_ORG.ID
    M_PRODUCT_ID int, -- товар, ссылка на dbo.M_PRODUCT.ID
    KOLVO int -- количество товара на складе
  );
  print('Table O_DILER_A_SKLAD created');
end;

GO


-- Дилер C - склад
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_DILER_C_SKLAD_ID'
)
begin
	create sequence dbo.SQ_O_DILER_C_SKLAD_ID start with 1 increment by 1 no cache;
end;

GO

-- Дилер C - склад
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_DILER_C_SKLAD'
)
begin
  CREATE TABLE dbo.O_DILER_C_SKLAD (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_DILER_C_SKLAD_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- пользователь который вввел данные
    M_ORG_ID int, -- дилер C, ссылка на dbo.M_ORG.ID
    M_PRODUCT_ID int, -- товар, ссылка на dbo.M_PRODUCT.ID
    KOLVO int -- количество товара на складе
  );
  print('Table O_DILER_C_SKLAD created');
end;

GO


GO

-- Дилер A - прайс
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_DILER_A_PRICE_ID'
)
begin
	create sequence dbo.SQ_O_DILER_A_PRICE_ID start with 1 increment by 1 no cache;
end;

GO

-- Дилер A - прайс
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_DILER_A_PRICE'
)
begin
  CREATE TABLE dbo.O_DILER_A_PRICE (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_DILER_A_PRICE_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- пользователь который вввел данные
    M_ORG_ID int, -- дилер A, ссылка на dbo.M_ORG.ID
    M_PRODUCT_ID_TOVAR int, -- товар, ссылка на dbo.M_PRODUCT.ID
    D decimal(18, 2), -- цена для дилера D
    ROZN decimal(18, 2), -- розница
    M_PRODUCT_ID_PODAROK int, -- подарок, ссылка на dbo.M_PRODUCT.ID
    C decimal(18, 2) -- цена для дилера C
  );
  print('Table O_DILER_A_PRICE created');
end;

GO

-- Отправка СМС - номер отправки
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_SMS_SEND_NUM'
)
begin
	create sequence dbo.SQ_O_SMS_SEND_NUM start with 1 increment by 1 no cache;
end;

GO

-- таблица логирования отправки смс
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_SMS_SEND'
)
begin
  CREATE TABLE dbo.O_SMS_SEND (
    ID int NOT NULL PRIMARY KEY identity(1,1),
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- пользователь, который выполнил отправку S_USER.ID
    M_ORG_ID int, -- организация пользователя M_ORG.ID
    O_ANK_ID int,	-- ссылка на анкету O_ANK.ID
    SOOB varchar(4000), -- сообщение
    SEND_DATE smalldatetime, -- дата-время отправки
    SEND_LOGIN varchar(500), -- логин, с помощью которого отправлено сообщение S_USER.LOGIN1
    SEND_STATE int, -- статус отправки, 0 - успешная отправка, от 1 до 9 - коды ошибок из M_SMS_SEND_ERROR.NAME
    SEND_NUM int, -- порядковый номер отправки, если отправляется 100 смс, номер отправки у них один
    M_SMS_TEMPLATE_ID int -- ссылка на шаблон автоматической отправки сообщений M_SMS_TEMPLATE.ID
  );
  print('Table O_SMS_SEND created');
end;

-- таблица ошибок отправки смс 
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_SMS_SEND_ERROR'
)
begin
  CREATE TABLE dbo.M_SMS_SEND_ERROR (
    ID int NOT NULL PRIMARY KEY identity(1,1),
    NAME varchar(4000) -- наименование
  );
  print('Table M_SMS_SEND_ERROR created');
end;

-- таблица настроек
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_NASTR'
)
begin
  CREATE TABLE dbo.O_NASTR (
    ID int NOT NULL PRIMARY KEY identity(1,1),
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- пользователь, который сохранил данные
    M_ORG_ID int, -- организация пользователя M_ORG.ID
    SMS_LOGIN varchar(500), -- логин для смс отправки
    SMS_PASSWORD varchar(500), -- пароль для смс отправки
    SMS_SENDER varchar(500), -- отправитель смс - должен быть зарегистрирован в http://smsc.ru/senders/ и подтвержден гарантийным письмом от Дениса
    PHONE_MOBILE varchar(50),  -- мобильный телефон ответственного
    SIP_KEY varchar(500), -- ключ для звонков
    SIP_SECRET varchar(500), -- секретный ключ для звонков
    DILER_C_ACCESS int not null default 0, -- 1 - доступ в салон для Дилера С, если сам Дилер Д дает разрешение, 0 - запрет
    VNESH_VID_REG varchar(500) not null default 'SO_SPISKOM_MEST', -- внешний вид режима Регистрация, бывает SO_SPISKOM_MEST - первый вариант и SO_SPISKOM_FIO - второй вариант
    SHOW_KONT int not null default 1, -- 1 - отображать контакты в режиме "Запись", 0 - нет
    SMS_AUTO_SEND int not null default 0 -- 1 - активировать автоматическую СМС-рассылку, 0 - нет
  );
  print('Table O_NASTR created');
end;

GO

-- Справочник действий
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_DEISTV'
)
begin
  CREATE TABLE dbo.M_DEISTV (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500), -- наименование
    M_ORG_ID int -- организация пользователя
  );
  print('Table M_DEISTV created');
end;

GO

-- Журнал - действие, лог действий сотрудников в системе
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_DEISTV'
)
begin
  CREATE TABLE dbo.O_DEISTV (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    D_START smalldatetime,
    D_FIN smalldatetime, -- дата логического удаления
    M_ORG_ID int, -- организация пользователя
    USERID int, -- пользователь
    M_DEISTV_ID int, -- ссылка на M_DEISTV.ID, тип действия
    MESS varchar(4000), -- описание ошибки
    O_ANK_ID int,
    O_SKLAD_PR_ID int,
    O_SKLAD_RAS_ID int,
    O_RAS_DOK_ID int
  );
  print('Table O_DEISTV created');
end;

GO

-- Группа, для уведомлений
if not exists (
  select * from sys.sequences as s where s.name = 'SQ_O_UVEDOML_GR'
)
begin
	create sequence dbo.SQ_O_UVEDOML_GR start with 1 increment by 1 no cache;
end;

GO

-- Уведомления и запланированные действия
if not EXISTS (
  SELECT * FROM information_schema.tables as t WHERE t.table_name = 'O_UVEDOML'
)
begin
	create table dbo.O_UVEDOML
	(
		ID int identity(1,1) primary key,
		FIO varchar(max),		-- фио , вводят руками
		PHONE varchar(100),	-- телефон, с маской, по нему определяем анкету
		O_ANK_ID int,			-- ссылка на анкету
		M_VID_SOB_ID int,			-- событие, выбирается из редактируемого справочника, возможно у каждого салона свой M_VID_SOB.ID
		D_SOB smalldatetime,	-- дата события
		COMMENT varchar(max),	-- комментарий
		ISP int default 0,		-- 0 - запланировано, 1 - исполнено
		D_START smalldatetime,
		D_MODIF smalldatetime,
		USERID int,
		M_ORG_ID int,
		O_SEANS_ID int,
		O_KONT_ANK_ID int,
    O_SKLAD_RAS_ID int, -- ссылка на dbo.O_SKLAD_RAS.ID, если уведомление содаётся по Расходу со склада
    GR int not null default 0, -- группа, несколько уведомлений могут объединяться в одну группу, в частности это нужно для режима Расход со склада, значение берётся из sequence SQ_O_UVEDOML_GR
    O_SKLAD_RAS_NOMER int -- для режима Расход со склада создаётся до 5ти объединённых уведомлений, 1ое для доплаты, 2ое - 5ое для звонков, в этом поле хранится соответствующий номер 
	)
  print('Table O_UVEDOML created');
end;

GO

-- Комментарии к группам уведомлений
if not exists (
  select * from sys.sequences as s where s.name = 'SQ_O_UVEDOML_GR_COMMENT_ID'
)
begin
	create sequence dbo.SQ_O_UVEDOML_GR_COMMENT_ID start with 1 increment by 1 no cache;
end;

GO

-- Комментарии к группам уведомлений
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_UVEDOML_GR_COMMENT'
)
begin
  CREATE TABLE dbo.O_UVEDOML_GR_COMMENT (
    ID int not null primary key default next value for dbo.SQ_O_UVEDOML_GR_COMMENT_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    M_ORG_ID int, -- организация пользователя, создавшего комментарий к уведомлению
    USERID int, -- пользователь, создавший комментарий к уведомлению
    O_UVEDOML_GR int, -- ссылка на dbo.O_UVEDOML.GR, группа уведомлений
    O_UVEDOML_ID int, -- ссылка на dbo.O_UVEDOML.ID, уведомление, по которому создан комментарий
    COMMENT varchar(4000) -- текст комментария
    
  );
  print('Table O_UVEDOML_GR_COMMENT created');
end;

GO

GO

-- Справочник вид сообщения в уведомлениях
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_VID_SOB'
)
begin
  CREATE TABLE dbo.M_VID_SOB (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500), -- наименование
    M_ORG_ID int -- организация пользователя
  );
  print('Table M_VID_SOB created');
end;

GO

-- Справочник да, нет
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_YES_NO'
)
begin
  CREATE TABLE dbo.M_YES_NO (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500) -- наименование
  );
  print('Table M_YES_NO created');
end;

GO

-- Справочник вопросов
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_VOPROS'
)
begin
  CREATE TABLE dbo.M_VOPROS (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500), -- наименование
    M_ORG_ID int -- организация пользователя
  );
  print('Table M_VOPROS created');
end;

GO

-- Анкета - Вопросы
if not EXISTS (
  SELECT * FROM information_schema.tables as t WHERE t.table_name = 'O_VOPROS'
)
begin
	create table O_VOPROS (
		ID int identity(1,1) primary key,
		M_VOPROS_ID int, -- ссылка на M_VOPROS.ID, справочник вопросов
		M_VOPROS_TAB_ID int, -- cсылка на вкладку, к которой относится вопрос
		O_ANK_ID int, -- ссылка на анкету O_ANK.ID
		M_YES_NO_ID int, -- справочник M_YES_NO.ID, ответ - да/нет
		COMMENT varchar(max), --комментарий
    D_START smalldatetime, -- дата новой записи
    D_MODIF smalldatetime, -- дата редактирования
    M_ORG_ID int, -- организация пользователя
    USERID int -- пользователь
	);
  print('Table O_VOPROS created');
end;

GO

if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_M_VOPROS_TAB_ID'
)
begin
	create sequence dbo.SQ_M_VOPROS_TAB_ID start with 1 increment by 1 no cache;
end;

GO

-- Справочник вкладок в Анкета - Вопросы
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_VOPROS_TAB'
)
begin
  CREATE TABLE dbo.M_VOPROS_TAB (
    ID int NOT NULL PRIMARY KEY,
    NAME varchar(500), -- наименование
    M_ORG_ID int -- организация пользователя
  );
  print('Table M_VOPROS_TAB created');
end;

GO


-- Выписка
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_VIPIS_ID'
)
begin
	create sequence dbo.SQ_O_VIPIS_ID start with 1 increment by 1 no cache;
end;

GO

-- Выписка
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_VIPIS'
)
begin
  CREATE TABLE dbo.O_VIPIS (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_VIPIS_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    M_ORG_ID int, -- организация пользователя
    USERID int, -- пользователь
    O_ANK_ID int, -- ссылка на анкету O_ANK.ID
    M_ZABOL_GROUP_ID int, -- статус, ссылка на M_ZABOL_GROUP.ID
    ZABOL_TEXT varchar(4000), -- произвольное описание заболевания
    ULUCH_TEXT varchar(4000), -- произвольное описчание улучшения
    D_ULUCH smalldatetime, -- дата улучшения
    LINK varchar(4000), -- ссылка на видео с Youtube.com, информация до начала посещений
    LINK_POSLE varchar(4000) -- ссылка на видео с Youtube.com, информация после начала посещений
  );
  print('Table O_VIPIS created');
end;


-- Выписка - файлы болезни
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_VIPIS_FILE_ZABOL_ID'
)
begin
	create sequence dbo.SQ_O_VIPIS_FILE_ZABOL_ID start with 1 increment by 1 no cache;
end;

GO

-- Выписка - файлы болезни
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_VIPIS_FILE_ZABOL'
)
begin
  CREATE TABLE dbo.O_VIPIS_FILE_ZABOL (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_VIPIS_FILE_ZABOL_ID,
    D_START smalldatetime,
    M_ORG_ID int, -- организация пользователя
    USERID int, -- пользователь
    O_VIPIS_ID int, -- ссылка на выписку dbo.O_VIPIS.ID
    FNAME varchar(4000), -- имя файла, только имя, без пути
    F varbinary(max) -- сам бинарный файл
  );
  print('Table O_VIPIS_FILE_ZABOL created');
end;


-- Выписка - файлы улучшения
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_VIPIS_FILE_ULUCH_ID'
)
begin
	create sequence dbo.SQ_O_VIPIS_FILE_ULUCH_ID start with 1 increment by 1 no cache;
	print('Sequence SQ_O_VIPIS_FILE_ULUCH_ID created');
end;

GO

-- Выписка - файлы улучшения
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_VIPIS_FILE_ULUCH'
)
begin
  CREATE TABLE dbo.O_VIPIS_FILE_ULUCH (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_VIPIS_FILE_ULUCH_ID,
    D_START smalldatetime,
    M_ORG_ID int, -- организация пользователя
    USERID int, -- пользователь
    O_VIPIS_ID int, -- ссылка на выписку dbo.O_VIPIS.ID
    FNAME varchar(4000), -- имя файла, только имя, без пути
    F varbinary(max) -- сам бинарный файл
  );
  print('Table O_VIPIS_FILE_ULUCH created');
end;


-- Улучшения в режиме Выписка
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_VIPIS_ULUCH_ID'
)
begin
	create sequence dbo.SQ_O_VIPIS_ULUCH_ID start with 1 increment by 1 no cache;
	 print('Sequence SQ_O_VIPIS_ULUCH_ID created');
end;

GO

-- Улучшения в режиме Выписка
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_VIPIS_ULUCH'
)
begin
  CREATE TABLE dbo.O_VIPIS_ULUCH (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_VIPIS_ULUCH_ID,
    D_START smalldatetime,
    M_ORG_ID int, -- организация пользователя
    USERID int, -- пользователь
    O_VIPIS_ID int, -- ссылка dbo.O_VIPIS.ID
    M_ZABOL_ID int not null -- заболевание по которому улучшение, ссылка на M_ZABOL.ID
  );
  print('Table O_VIPIS_ULUCH created');
end;



GO


-- Задача
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_ZADACHA_ID'
)
begin
	create sequence dbo.SQ_O_ZADACHA_ID start with 1 increment by 1 no cache;
end;

GO

-- Задача
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_ZADACHA'
)
begin
  CREATE TABLE dbo.O_ZADACHA (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_ZADACHA_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    M_ORG_ID int, -- организация пользователя, создавшего задачу
    USERID int, -- пользователь, создавший задачу
    M_ORG_ID_ZADACHA int, -- организация, на которую создаётся задача
    D_BEG smalldatetime, -- дата действия задачи С
    D_END smalldatetime, -- дата действия задачи По
    TEMA varchar(500), -- тема задачи
    ZADACHA varchar(4000), -- содержание задачи
    D_VIP smalldatetime, -- дата выполнения задачи
    USERID_VIP int -- кто выполнил задачу
  );
  print('Table O_ZADACHA created');
end;

GO

-- Оповещение
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_OPOV_ID'
)
begin
	create sequence dbo.SQ_O_OPOV_ID start with 1 increment by 1 no cache;
end;

GO

-- Оповещение
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_OPOV'
)
begin
  CREATE TABLE dbo.O_OPOV (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_ZADACHA_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    M_ORG_ID int, -- организация пользователя, сгенерировшая оповещение
    M_ORG_ID_SOURCE int, -- для TIP = 1, организация, в которой уже есть анкета с таким номером
    USERID int, -- пользователь, сгенерировавший оповещение
    O_ANK_ID int, -- ссылка на анкету, dbo.O_ANK.ID
    O_ANK_ID_SOURCE int, -- для TIP = 1, анкета с таким же номером, но в другой организации
    O_SKLAD_RAS_ID int, -- ссылка на расход со склада, dbo.O_SKLAD_RAS.ID
    O_SKLAD_RAS_PRODUCT_ID int, -- ссылка на товар, который был продан по заниженной цене dbo.O_SKLAD_RAS_PRODUCT.ID
    TIP int not null default 0, -- 1 - зарегистрирован человек, который уже был зарегистрирован в другом салоне
                                -- 2 - кто-то продал товар дешевле, чем он стоит у Дилера A
    M_ORG_ID_A int -- для TIP = 2, ссылка на Дилера A, с которым сравнивается цена, dbo.M_ORG.ID
  );
  print('Table O_OPOV created');
end;

GO

-- cправочник статусов для контактов
if not exists (
  select * from information_schema.tables as t where t.table_name = 'M_KONT_STATUS'
)
begin
  create table dbo.M_KONT_STATUS (
    ID int identity(1,1) not null primary key,
    NAME varchar(500), -- наименование
    M_ORG_ID int -- организация пользователя
  );
  print('Table M_KONT_STATUS created');
end;


GO

-- cправочник источников для контактов
if not exists (
  select * from information_schema.tables as t where t.table_name = 'M_KONT_IST'
)
begin
  create table dbo.M_KONT_IST (
    ID int identity(1,1) not null primary key,
    NAME varchar(500), -- наименование
    M_ORG_ID int -- организация пользователя
  );
  print('Table M_KONT_IST created');
end;

GO


-- статистика работы пользователя в режиме Контакты
if not exists (
  select * from sys.sequences as s where s.name = 'SQ_O_KONT_STAT_ID'
)
begin
	create sequence dbo.SQ_O_KONT_STAT_ID start with 1 increment by 1 no cache;
end;

GO

-- статистика работы пользователя в режиме Контакты
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_KONT_STAT'
)
begin
  create table dbo.O_KONT_STAT (
    ID int not null primary key default next value for dbo.SQ_O_KONT_STAT_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    M_ORG_ID int, -- организация пользователя, изменившего контакт
    USERID int, -- пользователь, изменивших контакт
    TIP_IZM int, -- тип изменения, которое сделал пользователь: 1 - Звонок, 2 - Создан контакт, 3 - Добавлен комментарий, 4 - Изменён статус, 5 - Изменён источник
    M_KONT_STATUS_ID int null, -- заполняется при TIP_IZM = 4 - статус контакта после изменения, ссылка на dbo.M_KONT_STATUS.ID
    M_KONT_IST_ID int null -- заполняется при TIP_IZM = 5 - источник контакта после изменения, ссылка на dbo.M_KONT_IST.ID
  );
  print('Table O_KONT_STAT created');
end;

GO

-- Сопровождение - форма оплаты
if not exists (
  select * from information_schema.tables as t where t.table_name = 'M_SOPR_FORM_OPL'
)
begin
  create table dbo.M_SOPR_FORM_OPL (
    ID int identity(1,1) not null primary key,
    NAME varchar(500), -- наименование
    M_ORG_ID int -- организация пользователя
  );
  print('Table M_SOPR_FORM_OPL created');
end;

GO

-- Сопровождение - продукт
if not exists (
  select * from information_schema.tables as t where t.table_name = 'M_SOPR_PRODUCT'
)
begin
  create table dbo.M_SOPR_PRODUCT (
    ID int identity(1,1) not null primary key,
    NAME varchar(500), -- наименование
    M_ORG_ID int -- организация пользователя
  );
  print('Table M_SOPR_PRODUCT created');
end;

GO

-- Сопровождение - статусы
if not exists (
  select * from information_schema.tables as t where t.table_name = 'M_SOPR_STATUS'
)
begin
  create table dbo.M_SOPR_STATUS (
    ID int identity(1,1) not null primary key,
    NAME varchar(500), -- наименование
    M_ORG_ID int -- организация пользователя
  );
  print('Table M_SOPR_STATUS created');
end;


GO

-- комментарии для сеанса режима контакты
if not exists (
  select * from sys.sequences as s where s.name = 'SQ_O_KONT_SEANS_COMMENT_ID'
)
begin
	create sequence dbo.SQ_O_KONT_SEANS_COMMENT_ID start with 1 increment by 1 no cache;
end;

GO

-- комментарии для сеанса режима контакты
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_KONT_SEANS_COMMENT'
)
begin
  create table dbo.O_KONT_SEANS_COMMENT (
    ID int not null primary key default next value for dbo.SQ_O_KONT_SEANS_COMMENT_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    M_ORG_ID int, -- организация пользователя, создавшего контакт
    USERID int, -- пользователь, создавший контакт
    O_KONT_SEANS_ID int, -- ссылка на сеанс, dbo.O_KONT_SEANS.ID
    COMMENT varchar(max) -- комментарий
  );
  print('Table O_KONT_SEANS created');
end;

GO

-- Сопровождение
if not exists (
  select * from sys.sequences as s where s.name = 'SQ_O_SOPR_COMMENT_ID'
)
begin
	create sequence dbo.SQ_O_SOPR_COMMENT_ID start with 1 increment by 1 no cache;
end;

GO

-- Сопровождение
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_SOPR'
)
begin
  create table dbo.O_SOPR (
    ID int identity(1,1) not null primary key,
    D_START smalldatetime,
    M_ORG_ID int, -- организация пользователя, создавшего запись
    USERID int, -- пользователь, создавший запись
    M_SOPR_PRODUCT_ID int, -- ссылка на продукт, dbo.M_SOPR_PRODUCT.ID
		M_SOPR_FORM_OPL_ID int, -- ссылка на форму оплаты, dbo.M_SOPR_FORM_OPL.ID
		M_SOPR_STATUS_ID int, -- ссылка на статус, dbo.M_SOPR_STATUS.ID
		M_SOPR_DOP_ID int, -- cссылка на доп. услуги dbo.M_SOPR_DOP.ID
		O_ANK_ID int, -- ссылка на анкету O_ANK.ID
		IS_SROCHNO int not null default 0
  );
  print('Table O_SOPR created');
end;

-- Сопровождение - комментарии
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_SOPR_COMMENT'
)
begin
  create table dbo.O_SOPR_COMMENT (
    ID int not null primary key default next value for dbo.SQ_O_SOPR_COMMENT_ID,
    D_START smalldatetime,
    M_ORG_ID int, -- организация пользователя, создавшего запись
    USERID int, -- пользователь, создавший запись
		O_SOPR_ID int, -- ссылка на сопровождение O_SOPR.ID
    COMMENT varchar(max), -- комментарий
		ZADACHA varchar(1000) -- задача
  );
  print('Table O_SOPR_COMMENT created');
end;

-- Сопровождение - доп. услуги
if not exists (
  select * from information_schema.tables as t where t.table_name = 'M_SOPR_DOP'
)
begin
  create table dbo.M_SOPR_DOP (
    ID int identity(1,1) not null primary key,
    NAME varchar(500), -- наименование
    M_ORG_ID int -- организация пользователя
  );
  print('Table M_SOPR_DOP created');
end;

GO

-- Продление
if not exists (
  select * from sys.sequences as s where s.name = 'SQ_O_PRODL_COMMENT_ID'
)
begin
	create sequence dbo.SQ_O_PRODL_COMMENT_ID start with 1 increment by 1 no cache;
end;

GO

-- Продление
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_PRODL'
)
begin
  create table dbo.O_PRODL (
    ID int identity(1,1) not null primary key,
    D_START smalldatetime,
    M_ORG_ID int, -- организация пользователя, создавшего запись
    USERID int, -- пользователь, создавший запись
		M_SOPR_STATUS_ID int, -- ссылка на статус, dbo.M_SOPR_STATUS.ID
		M_SOPR_DOP_ID int, -- cссылка на доп. услуги dbo.M_SOPR_DOP.ID
		O_ANK_ID int, -- ссылка на анкету O_ANK.ID
		IS_SROCHNO int not null default 0
  );
  print('Table O_PRODL created');
end;

GO

-- Продление - комментарии
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_PRODL_COMMENT'
)
begin
  create table dbo.O_PRODL_COMMENT (
    ID int not null primary key default next value for dbo.SQ_O_PRODL_COMMENT_ID,
    D_START smalldatetime,
    M_ORG_ID int, -- организация пользователя, создавшего запись
    USERID int, -- пользователь, создавший запись
		O_PRODL_ID int, -- ссылка на продление O_PRODL.ID
    COMMENT varchar(max), -- комментарий
		ZADACHA varchar(1000) -- задача
  );
  print('Table O_PRODL_COMMENT created');
end;

GO

-- Мотивация
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_MOTIV'
)
begin
  create table dbo.O_MOTIV (
    ID int identity(1,1) not null primary key,
    D_BEG smalldatetime,
		D_END smalldatetime,
    M_ORG_ID int, -- организация пользователя, создавшего запись
    USERID int, -- пользователь, создавший запись
		SUMMA numeric(15,2), -- сумма плана на период
		PROCENT numeric(15,2) -- процент от плана для зарплаты, для всех сотрудников одинаковая зарплата
  );
  print('Table O_MOTIV created');
end;

GO

-- таблица типов шаблонов смс 
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_SMS_TEMPLATE_TYPE'
)
begin
  CREATE TABLE dbo.M_SMS_TEMPLATE_TYPE (
    ID int NOT NULL PRIMARY KEY identity(1,1),
    NAME varchar(1000), -- наименование
    M_ORG_ID int -- организация пользователя, создавшего запись - не учитывается, типы общие для всех
  );
  print('Table M_SMS_TEMPLATE_TYPE created');
end;

GO

-- таблица шаблонов смс 
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_SMS_TEMPLATE'
)
begin
  CREATE TABLE dbo.M_SMS_TEMPLATE (
    ID int NOT NULL PRIMARY KEY identity(1,1),
    M_SMS_TEMPLATE_TYPE_ID int, -- тип смс шаблона M_SMS_TEMPLATE_TYPE.ID
    SOOB varchar(4000), -- текст шаблона СМС
    M_ORG_ID int -- организация пользователя, создавшего запись - шаблоны выбирается только по своей организации
  );
  print('Table M_SMS_TEMPLATE created');
end;


GO

-- Приостановка абонемента (заморозка)
if not exists (
  select * from sys.sequences as s where s.name = 'SQ_O_ABON_PRIOST_ID'
)
begin
	create sequence dbo.SQ_O_ABON_PRIOST_ID start with 1 increment by 1 no cache;
end;

GO

-- Приостановка абонемента (заморозка)
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_ABON_PRIOST'
)
begin
  create table dbo.O_ABON_PRIOST (
    ID int not null primary key default next value for dbo.SQ_O_ABON_PRIOST_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    M_ORG_ID int, -- организация пользователя, создавшего контакт
    USERID int, -- пользователь, создавший контакт
    O_ANK_ID int, -- ссылка на анкету, dbo.O_ANK.ID
    O_SKLAD_RAS_PRODUCT_ID int, -- приостановленный абонемент, ссылка на dbo.O_SKLAD_RAS_PRODUCT.ID
    D_PRIOST_S smalldatetime, -- дата приостановки абонемента С
    D_PRIOST_PO smalldatetime -- дата приостановки абонемента По
  );
  print('Table O_ABON_PRIOST created');
end;


-- таблица отмеченных (используемых) товаров для салона
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_PRODUCT_ORG'
)
begin
  CREATE TABLE dbo.M_PRODUCT_ORG (
    ID int NOT NULL PRIMARY KEY identity(1,1),
    M_PRODUCT_ID int, -- ссылка на dbo.M_PRODUCT.ID - товар, который используется в организации
    M_ORG_ID int -- организация, для которой выбран товар
  );
  print('Table M_PRODUCT_ORG created');
end;

GO

-- Изменение (уменьшение) количества посещений по абонементу с доп. услугами
if not exists (
  select * from sys.sequences as s where s.name = 'SQ_O_ABON_DOP_USL_IZM_ID'
)
begin
	create sequence dbo.SQ_O_ABON_DOP_USL_IZM_ID start with 1 increment by 1 no cache;
end;

GO

-- Изменение (уменьшение) количества посещений по абонементу с доп. услугами
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_ABON_DOP_USL_IZM'
)
begin
  create table dbo.O_ABON_DOP_USL_IZM (
    ID int not null primary key default next value for dbo.SQ_O_ABON_DOP_USL_IZM_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    M_ORG_ID int, -- организация пользователя, выполнившего изменение количества
    USERID int, -- пользователь, выполнивший изменение количества
    O_ANK_ID int, -- ссылка на анкету, dbo.O_ANK.ID
    O_SKLAD_RAS_PRODUCT_ID int, -- по какой доп. услуги произошло уменьшение количества, ссылка на dbo.O_SKLAD_RAS_PRODUCT.ID
    D_IZM smalldatetime -- дата уменьшения количества
  );
  print('Table O_ABON_DOP_USL_IZM created');
end;

GO

