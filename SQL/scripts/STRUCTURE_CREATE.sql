/* ������-CRM - �������� ��������� */

--set nocount on;
--set ansi_warnings off;

--GO

--if object_id('tempdb..#temp') is not null drop table #temp;

--GO

------ �������� ��
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

-- ������
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_ANK_ID'
)
begin
	create sequence dbo.SQ_O_ANK_ID start with 1 increment by 1 no cache;
end;

GO

-- �������� O_ANK - ������ ��������
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_ANK'
)
begin
  create table dbo.O_ANK (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_ANK_ID,
    SURNAME varchar(500), -- �������
    NAME varchar(500), -- ���
    SECNAME varchar(500), -- ��������
    SEX smallint,    -- ���, M_SEX.ID - 1 - �������, 2 - �������
    BIRTHDAY smalldatetime,  -- ���� ��������
    PHONE_MOBILE varchar(50),  -- ��������� �������
    PHONE_HOME varchar(50),  -- �������� �������
    REGION varchar(500),  -- ������
    CITY varchar(500),  -- �����/����
    STREET varchar(500),  -- �����
    HOUSE varchar(50),  -- ���
    FLAT varchar(50),  -- ��������
    CORPUS varchar(50),  -- ������
    DISTRICT varchar(500),  -- �����
    POST_INDEX varchar(50),  -- �������� ������
    IST_INFO smallint, -- �������� ����������, M_IST_INFO.ID -- ����������
    FIO_INFO_ID int,   -- �������� ���������� ���, O_ANK.ID - ������ �� ������, ��� ��������� ����� ��������, ����� �������� ���������� = ����������
    USER_REG int,  -- ���������������(�), ������ �� dbo.S_USER.ID, ���������� ��� ������ ������, �� ����� ��������� � ����������� �� �����
    DATE_REG smalldatetime,  -- ���� �����������, ���������� ���� �������� ������, �� ����� ��������� � ����������� �� �����
    PHOTO varbinary(max),  -- ���� �������
    M_ORG_ID int, -- ������ �� M_ORG.ID, �����������, ��� ��� ������
    BONUS int not null default 0, -- ���� �� �����, ��������� � ������� ������, 1 - ����, 0 - ���
    AKTIVIST int not null default 0, -- �������� �� ���������� (����� �� ����-��), ��������� � ������� ������, 1 - ��������, 0 - �� ��������
    GPS_LG decimal(12, 8), -- ���������� ����� ������, ������� (longitude)
    GPS_LT decimal(12, 8), -- ���������� ����� ������, ������ (latitude)
    VIP int not null default 0, -- 1 - VIP-������, 0 - ���
    D_SKRYT_PO smalldatetime, -- ���� �������� ������ ��� ���� - ������ - �� �����
		ID_CODE int not null default 0 -- �����-���
  );
  print('Table O_ANK created');
end;

GO

-- �������� ������� O_ZVONOK -  ���������� ���������� � �������
-- ���� ������ ��� � ������� - ������ � ������ �������, �� ������� ��� �� ����
--  ���� ������ ���� �  ������ ���������� �� ���������� - ������ ��������� �� ������ �������
-- ���� ������ ���������� �� ����� ��� ������ ���������� ���������� -  ������ �������� � ������ �������
if not EXISTS (
  SELECT * FROM information_schema.tables as t WHERE t.table_name = 'O_ZVONOK'
)
begin
  CREATE TABLE dbo.O_ZVONOK (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    O_ANK_ID int NOT NULL,
    D_END_ISKL smalldatetime,-- ��������� ������� ����������
    M_ISKL_ID int,       -- ������� ���������� �� ����������� M_ISKL
    OPERATOR varchar(100),   -- ������������ ���
    D_MODIF smalldatetime,   -- ���� ��������������
    D_START  smalldatetime,   -- ���� ��������
    COMMENT varchar(4000), -- �����������
    M_ORG_ID int, -- ������ �� M_ORG.ID, �����������, ��� ��� ������
	  D_START_USER_ID int, --������������ ��������� ������
    D_MODIF_USER_ID int, --������������ ������� ��������� ���������
    D_END_ISKL_USER_ID int --������������ �����������
  );
  print('Table O_ZVONOK created');
end;

GO

-- �������� c���������� M_SHABLON - ����������� ���������� �������� ������� ��� �������
if not EXISTS (
  SELECT * FROM information_schema.tables as t WHERE t.table_name = 'M_SHABLON'
)
begin
  CREATE TABLE dbo.M_SHABLON (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,    
    SHABLON_NAME varchar(500),  -- �������� �������
    SHABLON_TEXT varchar(5000),  -- ����� �������
    D_CREATE smalldatetime,  -- ���� ��������
    OPERATOR varchar(100),  -- ������������ ���
    M_ORG_ID int -- ����������� ������������
  );
  print('Table M_SHABLON created');
end;

GO

-- �������� ����������� M_PRICH_ISKL -  ���������� ������ ���������� ������������ �� ������ �������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_PRICH_ISKL'
)
begin
  CREATE TABLE dbo.M_PRICH_ISKL (
      ID int NOT NULL PRIMARY KEY,  
      NAME varchar(500),  -- �������  
      M_ORG_ID int -- ����������� ������������
  );
  print('Table M_PRICH_ISKL created');
  
end;

GO

-- �������� ����������� O_DIALOG - ������� � ��������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_DIALOG'
)
begin
  CREATE TABLE dbo.O_DIALOG (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    O_ANK_ID int, -- ������ �� ������
    COMMENT varchar(4000),  -- �����������
    USERID int, -- ���������
    M_ORG_ID int, -- ����������� ����������
    NPOS varchar(100), -- ����,����� � ��� ���������� � ������, ��� ������ � �������
    DIALOG_DATE smalldatetime, -- ��� �������, ����� �� ������� npos
    O_SEANS_ID int -- ������ �� ������� �����
  );
  print('Table O_DIALOG created');
end;

GO

-- �������� ����������� O_STATUS - ������� ������� �������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_STATUS'
)
begin
  CREATE TABLE dbo.O_STATUS (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    O_ANK_ID int, -- ������ �� ������
    M_STATUS_ID int,   -- ������ �� ���������� �������� M_STATUS.ID
    M_PRODUCT_ID int,  -- ������ �� ����� M_PRODUCT.ID
    STATUS_DATE smalldatetime,  -- ���� �������
    USERID int, -- ���������
    M_ORG_ID int -- ����������� ����������
  );
  print('Table O_STATUS created');
end;

GO

-- ����������� ��������� � ������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_ANK_ZABOL'
)
begin
  CREATE TABLE dbo.O_ANK_ZABOL (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    O_ANK_ID int, -- ������ �� ������
    M_ZABOL_ID int, -- ����������� �� ����������� M_ZABOL
    M_ORG_ID int -- ����������� ����������
  );
  print('Table O_ANK_ZABOL created');
end;

GO

-- ���������� �������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_SEANS_TIME'
)
begin
  CREATE TABLE dbo.M_SEANS_TIME (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(100), -- ����� � ��������� ����, ����. 09:00 - 09:40
    MIN_TIME varchar(50), -- ����� � ��������� ����, ����. 09:00
    MAX_TIME varchar(50), -- ����� � ��������� ����, ����. 09:40
    M_ORG_ID int, -- ����������� ������������
    MIN_TIME_MINUTES as cast(substring(MIN_TIME, 1, 2) as int) * 60 + cast(substring(MIN_TIME, 4, 2) as int), -- ����������� ����� ������������ � �������
    MAX_TIME_MINUTES as cast(substring(MAX_TIME, 1, 2) as int) * 60 + cast(substring(MAX_TIME, 4, 2) as int) -- ������������ ����� ������������ � �������
    
  );
  print('Table M_SEANS_TIME created');
end;

GO

-- ����� �� ������ (�����, ������������ � �.�.)
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_SEANS_PLACE'
)
begin
  CREATE TABLE dbo.M_SEANS_PLACE (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(100), -- ������������ �����
    M_PRODUCT_ID int, -- M_PRODUCT.ID ��� ������������
    M_RYAD_ID int, -- M_RYAD.ID ������ ������������, ��������, �������, ����� ����, �� ��� ���������� �� ������
    M_ORG_ID int -- ����������� ������������
  );
  print('Table M_SEANS_PLACE created');
end;

GO

-- ����������� �� �����
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_SEANS'
)
begin
  CREATE TABLE dbo.O_SEANS (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    O_ANK_ID int, -- ������ �� ������
    M_SEANS_TIME_ID int, -- ������ �� ����� ������ M_SEANS_TIME.ID
    M_SEANS_PLACE_ID int, -- ������ �� ����� ������ M_SEANS_PLACE.ID
    SEANS_DATE smalldatetime, -- ����, �� ������� ����������, ��� �������, ����� ������ ���� 00:00
    SEANS_STATE int NOT NULL default 0, -- SEANS_STATE: 0 - ��������� �� �����, 1 - ����� ���������
    M_RYAD_ID int, -- c����� �� M_RYAD.ID - ������ �� ���������� �����
    USERID int, -- ���������, ��������� ������ �� �����
    D_START smalldatetime, -- ���� �������� ������
    LANE int, -- 1 - ������� �� �����
    USERID_REG int, -- ���������, ����������� �����������
    D_REG smalldatetime, -- ���� �����������
    BEZ_REG int not null default 0, -- 1 - �� ���������������
    M_ORG_ID int, -- ������ �� M_ORG.ID, �����������, ��� ��� ������
    ANK int not null default 0, -- 1 - ��������������� �� ������
    D_MODIF smalldatetime, -- ���� �������������� ������, �������� ��������, ����� ������������ �������������� ����������� ��������
    IS_FIRST_KONT_SEANS int not null default 0, -- �������� 1, ����� �������� ������ �� ������������ ������� � ��� �������� ������ ���������� ����������� �� ����� (������ ����� ��������)
    FROM_ZVONOK int not null default 0, -- 1, ���� ����� ������ �� ������ ������
    IS_GOST int not null default 0 -- 1, ���� ��� ����� (���������� �� ������� ������)
  );
  print('Table O_SEANS created');
end;

GO

-- ����������� ��� ������ (�� ����� ���� ����������� � �����)
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_SEANS_COMMENT'
)
begin
  CREATE TABLE dbo.O_SEANS_COMMENT (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    SEANS_DATE smalldatetime, -- ���� �����������
    COMMENT varchar(4000),  -- �����������
    USERID int -- ���������
  );
  print('Table O_SEANS_COMMENT created');
end;

GO

-- ���������� �������
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

-- ���������� ��� � ����
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

-- ���������� �������
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

-- �������� ������� O_COMPLAINT - �������� "��� ��������� ������ �����?" �� �������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_COMPLAINT'
)
begin
  CREATE TABLE dbo.O_COMPLAINT (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    O_ANK_ID int, -- ������ �� ������
    COMMENT varchar(4000),  -- ������
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- ������������ ������� ����� ������
    M_ORG_ID int -- ����������� ������������
  );
  print('Table O_COMPLAINT created');
end;

GO

-- ���������� �����������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_ZABOL'
)
begin
  CREATE TABLE dbo.M_ZABOL (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500),
    M_ZABOL_GROUP_ID int,
    M_ORG_ID int -- ����������� ������������
  );
  print('Table M_ZABOL created');
end;

GO

-- ���������� �����
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_RYAD'
)
begin
  CREATE TABLE dbo.M_RYAD (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500)--,
    --M_ORG_ID int -- ����������� ������������ -- �� �����
  );
  print('Table M_RYAD created');
end;

GO

-- �������� ���������� (���������, ����������, ��� ������ � �.�.)
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_IST_INF'
)
begin
  CREATE TABLE dbo.M_IST_INF (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(100), -- ������������ ���������
    M_ORG_ID int -- ����������� ������������
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
    O_ANK_ID int, -- ������ �� ������ O_ANK.ID 
    M_SERVICE_TYPE_ID int, -- ������ �� ��� ������� M_SERVICE_TYPE.ID  
    M_PRODUCT_ID int, -- ������ �� ��� ������ M_PRODUCT.ID
    SERIAL_NUMBER varchar(100), -- �������� ����� ������, ���������� �������
    PRODUCT_PHOTO varbinary(max), -- ���� ��������� � ������ ������
    GUARANTEE_PHOTO varbinary(max), -- ���� ������������ ����� ������
    PRODUCT_CHECK varbinary(max),  -- �������� ���
    COMMENT varchar(4000), -- �����������
    USERID int, -- ���������
    D_START smalldatetime, -- ���� �������� ������
    M_ORG_ID int,	-- ����������� 
		D_MODIF smalldatetime,
		M_SERVICE_TYPE_ID_TEH_OTDEL int, -- ������ �� ��� �������, ����������� � ��������� M_SERVICE_TYPE.ID
		DATE_TEH_OTDEL smalldatetime,	-- ���� ��������� ����������, ����������� � ���������
		S_USER_ID_TEH_OTDEL int,	-- ��������� ���������
		COMMENT_TEH_OTDEL varchar(4000),	-- ����������� ���������
		M_ORG_ID_TEH_OTDEL int -- ����������� ���������
  );
  print('Table O_SERVICE created');
end;

GO

-- ���������� �������, ���������, ���� ������������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_PRODUCT'
)
begin
  CREATE TABLE dbo.M_PRODUCT (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500),
    M_ORG_ID int, -- ����������� ������������
		IS_ABON int not null default 0
  );
  print('Table M_PRODUCT created');
end;

GO

-- ���������� �������� �������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_SERVICE_TYPE'
)
begin
  CREATE TABLE dbo.M_SERVICE_TYPE (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500),
    M_ORG_ID int -- ����������� ������������
  );
  print('Table M_SERVICE_TYPE created');
end;

GO


-- ��� (�������, �������)
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_SEX'
)
begin
  CREATE TABLE dbo.M_SEX (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(100) -- ������������ ����
  );
  print('Table M_SEX created');
end;

GO

-- ���������������� ����
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'S_USER_ROLE'
)
begin
  CREATE TABLE dbo.S_USER_ROLE (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500), -- ������������ ����
    M_ORG_ID int -- ����������� ������������
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

-- ����������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'S_USER'
)
begin
  CREATE TABLE dbo.S_USER (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_S_USER_ID,
    S_USER_ROLE_ID int NOT NULL,
    SURNAME varchar(500), -- ������� c���������
    NAME varchar(500), -- ��� ����������
    SECNAME varchar(500), -- �������� ����������
    M_ORG_ID int, -- ����������� ������������
    AspNetUsersId nvarchar(128), -- ������ �� dbo.AspNetUsers.Id
    PHOTO varbinary(max),  -- ���� ������������
    D_START smalldatetime,
    BIRTHDAY smalldatetime, -- ���� �������� ����������
    HIRE_DATE smalldatetime, -- ���� ����� �� ������
    IS_ADM int not null default 0, -- 1, ���� ��������� � �������������, ��� �����������������, ������� ����� �������� ��� ����� ������������
    SIP_LOGIN varchar(500), -- ����� ��� �������
    SIP_PASSWORD varchar(500), -- ������ ��� �������
    PHONE_MOBILE varchar(50),  -- ��������� ������� ������������
    DISMISS_DATE smalldatetime, -- ���� ����������
    IS_DILER_A int not null default 0, -- 1, ���� ��������� � ������ �
    IS_DILER_C int not null default 0, -- 1, ���� ��������� � ������ �
    M_ORG_ID_DILER_A int, -- M_ORG_ID, ��� ����������� ������ � "�����" �����������, ��� �������� �� ������ 
    M_ORG_ID_DILER_C int  -- M_ORG_ID, ��� ����������� ������ � "�����" �����������, ��� �������� �� ������
  );
  print('Table S_USER created');
end;

GO

-- ������ ������� ����� ���������� � �������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'S_USER_SIGN_LOG'
)
begin
  CREATE TABLE dbo.S_USER_SIGN_LOG (
    ID int NOT NULL PRIMARY KEY identity,
    S_USER_ID int NOT NULL,
    D_SIGN smalldatetime -- ���� ����� � �������, ����������� 1 ��� �� ����
  );
  print('Table S_USER_SIGN_LOG created');
end;

GO

-- ���������� ��� ������ � combobox ������������ ����������� ������������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_MANUAL'
)
begin
  CREATE TABLE dbo.M_MANUAL (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME_ENG varchar(500), -- ������������ �� ���������� �����, ��� � ��
    NAME_RU varchar(500) -- ������������ �� ������� �����, ��� ����������� ������������
  );
  print('Table M_MANUAL created');
end;

GO

-- ���������� ����� �����������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_ORG_TYPE'
)
begin
  CREATE TABLE dbo.M_ORG_TYPE (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500) -- ������������ ���� �����������, �������� "����� A"
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

-- �����������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_ORG'
)
begin
  CREATE TABLE dbo.M_ORG (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_M_ORG_ID,
    NAME varchar(500), -- ������������ �����������
    PARENT_ID int NOT NULL, -- ������ �� dbo.M_ORG.ID ������������ �����������
    ADRES varchar(500), -- �����
    PHONE varchar(500), -- �������
    KOD_PODTV varchar(500), -- ��� �������������
    M_ORG_TYPE_ID int, -- ������ �� dbo.M_ORG_TYPE.ID
    TZ int, -- ������� ����, � ������� �������� �����������
    M_ORG_ID_TEH_OTDEL int, -- ���. �����, � �������� ��������� �����������, ������ �� dbo.M_ORG.ID, ��� M_ORG_TYPE_ID = 5
		DEISTV int not null default 1
  );
  print('Table M_ORG created');
end;

GO

-- ���������� ������ ����
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_PRAVO_GR'
)
begin
  CREATE TABLE dbo.M_PRAVO_GR (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500) -- ������������ ������
  );
  print('Table M_PRAVO_GR created');
end;

GO

-- ���������� ����� �� �����
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_PRAVO_REJ'
)
begin
  CREATE TABLE dbo.M_PRAVO_REJ (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500), -- ������������ ������
    M_PRAVO_GR_ID int -- ������ �� M_PRAVO_GR.ID
  );
  print('Table M_PRAVO_REJ created');
end;

GO

-- ���������� ����� �����������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_ZABOL_GROUP'
)
begin
  CREATE TABLE dbo.M_ZABOL_GROUP (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500), -- ������������ ������
    M_ORG_ID int -- ����������� ������������
  );
  print('Table M_ZABOL_GROUP created');
end;

GO

-- ������ ���� ��������� �����������
-- ���� ����� ���� � �������, ������ ��� �������� �����������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_PRAVO_GR'
)
begin
  CREATE TABLE dbo.O_PRAVO_GR (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    S_USER_ID int, -- ������ �� S_USER.ID
    M_PRAVO_GR_ID int -- ������ �� M_PRAVO_GR.ID
  );
  print('Table O_PRAVO_GR created');
end;

GO

-- ����� �� ����� ��������� �����������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_PRAVO_REJ'
)
begin
  CREATE TABLE dbo.O_PRAVO_REJ (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    S_USER_ID int, -- ������ �� S_USER.ID
    M_PRAVO_REJ_ID int, -- ������ �� M_PRAVO_REJ.ID,
    READ1 int, -- 1 - �������� ����� �� ������
    WRITE1 int -- 1 - �������� ����� �� ������
  );
  print('Table O_PRAVO_REJ created');
end;

GO

-- ���������� ����� ������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_METOD_OPL'
)
begin
  CREATE TABLE dbo.M_METOD_OPL (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500), -- ������������
    M_ORG_ID int -- ����������� ������������
  );
  print('Table M_METOD_OPL created');
end;

GO

-- ���������� �������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_STATUS'
)
begin
  CREATE TABLE dbo.M_STATUS (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500), -- ������������
    M_ORG_ID int -- ����������� ������������
  );
  print('Table M_STATUS created');
end;

GO

-- ���������� ������ �������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_RASHOD_STAT'
)
begin
  CREATE TABLE dbo.M_RASHOD_STAT (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500), -- ������������
    M_ORG_ID int -- ����������� ������������
  );
  print('Table M_RASHOD_STAT created');
end;

GO

-- ���������� ������� ����
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_WORK_DAY'
)
begin
  CREATE TABLE dbo.M_WORK_DAY (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    DAY_ID int,  -- ��������� ��� ������ �� javascript - {0-�����������, 1-�����������...6-�������}
    NAME varchar(500), -- ������������
    M_ORG_ID int -- ����������� ������������
  );
  print('Table M_WORK_DAY created');
end;

GO

-- ������ ��� ������ ��������
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_KONT_ANK'
)
begin
  create table dbo.O_KONT_ANK (
    ID int identity(1,1) primary key,
    SURNAME varchar(500), -- �������
    [NAME] varchar(500), -- ���
    SECNAME varchar(500), -- ��������
    PHONE varchar(50), -- �������
    M_ORG_ID int, -- �����������
    USERID int, -- ������������ ������� ����� ������
    SKR int not null default 0, -- ������� ������� ������; 0 - �� ������, 1 - ������ �������������, 2 - ������ ��� �������� ��������� ������
	  D_START smalldatetime, -- ���� �������� ��������
	  O_ANK_ID int,	-- ������������� ��������� ������ dbo.O_ANK.ID
    M_KONT_STATUS_ID int not null default 1, -- ������ ��������, ������ �� dbo.M_KONT_STATUS.ID
    M_KONT_IST_ID int not null default 1, -- �������� ��������, ������ �� dbo.M_KONT_IST.ID
    SKR_IZ_RECORD int not null default 0, -- ������� ����, ��� ������� ����� �� ������ ������ ������
    SOZD_NEPR int not null default 0 -- ������� ����, ��� �� ��������� ������ ����� ���������, ������� ���������, ���� �� ���������� ����� ���������� ����� ����������� ���� ������, ��� �����, ����� �� ������ �� ������� �� ���������
  );
  print('Table O_KONT_ANK created');
end;

GO

-- ������ ��� ������ ��������
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_KONT_SEANS'
)
begin
  create table dbo.O_KONT_SEANS (
      ID int identity(1,1) primary key,
      O_KONT_ANK_ID int, --������ ��� ������ ��������
      COMMENT varchar(max), --����������
      D_ZV smalldatetime, --���� ������
      SEANS_DATE smalldatetime, --���� ������ �� ������� ��������� �������, ����� ���� null, ���� ������� ������ � �� ��������� �� ����������
      M_SEANS_TIME_ID int, --������������� ������� ������, ����� ���� null, ���� ������� ������ � �� ��������� �� ����������
      M_ORG_ID int, --�����������
      USERID int --������������ ������� ����� ������
  );
  print('Table O_KONT_SEANS created');
end;

GO

-- ������ ��� ������ ��������, ������� ���������������
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_REK_ANK'
)
begin
  create table dbo.O_REK_ANK (
    ID int identity(1,1) primary key,
    SURNAME varchar(500), -- �������
    [NAME] varchar(500), -- ���
    SECNAME varchar(500), -- ��������
    PHONE varchar(50), -- �������
    M_ORG_ID int, -- �����������
    USERID int, -- ������������ ������� ����� ������
	  D_START smalldatetime, -- ���� �������� ��������
	  O_ANK_ID int,	-- ������������� ��������� ������ dbo.O_ANK.ID
	  SKR int not null default 0,  -- ������� ������� ������; 0 - �� ������, 1 - ������ �������������, 2 - ������ ��� �������� ��������� ������
    O_ANK_ID_REK int -- �������, ������� ��� ������������, ������ �� dbo.O_ANK.ID
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

-- ����� - ������, ��������� ���������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_SKLAD_PR'
)
begin
  CREATE TABLE dbo.O_SKLAD_PR (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_SKLAD_PR_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- ������������ ������� ����� ������
    M_ORG_ID int, -- ����������� ������������
    D_SCHET smalldatetime, -- ���� �����
    N_SCHET varchar(500) -- ���� (����� �����)
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

-- ����� - ������, ������������, ���������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_SKLAD_PR_PRODUCT'
)
begin
  CREATE TABLE dbo.O_SKLAD_PR_PRODUCT (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_SKLAD_PR_PRODUCT_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- ������������ ������� ����� ������
    M_ORG_ID int, -- ����������� ������������
    O_SKLAD_PR_ID int, -- ������ �� dbo.O_SKLAD_PR.ID
    M_PRODUCT_ID int,  -- ������ �� ����� M_PRODUCT.ID  
    KOLVO int, -- ���������� ���������
    COST decimal(18, 2) -- ���������
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

-- ����� - ������, ��������� ���������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_SKLAD_RAS'
)
begin
  CREATE TABLE dbo.O_SKLAD_RAS (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_SKLAD_RAS_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- ������������ ������� ����� ������
    M_ORG_ID int, -- ����������� ������������
    D_SCHET smalldatetime, -- ���� �����
    N_SCHET varchar(500), -- ���� (����� �����)
    SURNAME varchar(500), -- �������, �����, ���� O_ANK_ID is not null
    NAME varchar(500), -- ���, �����, ���� O_ANK_ID is not null
    SECNAME varchar(500), -- ��������, �����, ���� O_ANK_ID is not null
    STREET varchar(500),  -- �����, �����, ���� O_ANK_ID is not null
    POST_INDEX varchar(50),  -- �������� ������, �����, ���� O_ANK_ID is not null
    PHONE_MOBILE varchar(50),  -- ��������� �������, �����, ���� O_ANK_ID is not null
    O_ANK_ID int, -- ������ �� dbo.O_ANK.ID
    S_USER_ID int, -- ������ �� dbo.S_USER.ID, ��������� (������������� ������)
    SEMYA_VSEGO int, -- ������� ������ ����� � ���� ���������
    HODIT int -- �����
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

-- ����� - ������, ������������, ���������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_SKLAD_RAS_PRODUCT'
)
begin
  CREATE TABLE dbo.O_SKLAD_RAS_PRODUCT (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_SKLAD_RAS_PRODUCT_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- ������������ ������� ����� ������
    M_ORG_ID int, -- ����������� ������������
    O_SKLAD_RAS_ID int, -- ������ �� dbo.O_SKLAD_RAS.ID
    M_PRODUCT_ID int,  -- ������ �� ����� M_PRODUCT.ID  
    KOLVO int, -- ���������� ���������
    TSENA decimal(18, 2), -- ����
    SKIDKA decimal(5, 3), -- ������ � ���������
    COST decimal(18, 2), -- ���������
    IS_AKTSIYA int not null default 0, -- 1 - ���� �����
    OPL_VSEGO decimal(18,2), -- ������� ��������
    OPL_OST decimal(18,2), -- ���������� ��������� (�������� ��������)
    IS_VID int not null default 0, -- 1 - ���� ������
    D_VID smalldatetime, -- ���� ������
		IS_ABON int not null default 0, -- 1 - ����� �������� �����������
		D_DEISTV smalldatetime, -- ���� ��������
    /* ���� ������������ ���������� ���������� � ������� dbo.O_ABON_PRIOST */
    KOLVO_POS int -- ���������� ���������, ��� ���������� � �����������
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

-- ����� - ������ �������, ��������� �������� ������� �� ��������� ���������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_SKLAD_RAS_PRODUCT_OPL'
)
begin
  CREATE TABLE dbo.O_SKLAD_RAS_PRODUCT_OPL (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_SKLAD_RAS_PRODUCT_OPL_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- ������������ ������� ����� ������
    M_ORG_ID int, -- ����������� ������������
    O_SKLAD_RAS_PRODUCT_ID int, -- ������ �� dbo.O_SKLAD_RAS_PRODUCT.ID
    OPL decimal(18,2), -- ��������� ������ (������� ��������)
    D_OPL smalldatetime, -- ���� ������ (���� ��������� ������)
    M_METOD_OPL_ID int, -- ������ �� M_METOD_OPL.ID, ����� ������
    SERIAL varchar(500) -- �������� �����
  );
  print('Table O_SKLAD_RAS_PRODUCT_OPL created');
end;

GO

-- ����� - ������ �������, ��������� �������� ������� �� ��������� ���������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_RAS_DOK'
)
begin
  CREATE TABLE dbo.O_RAS_DOK (
    ID int NOT NULL PRIMARY KEY IDENTITY(1,1),
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- ������������ ������� ����� ������
    M_ORG_ID int, -- ����������� ������������
    M_RASHOD_STAT_ID int, -- ������ ������� - M_RASHOD_STAT.ID
    D_SCHET smalldatetime, -- ���� �����
    N_SCHET varchar(500), -- ���� (����� �����)
    POSTAV_NAME varchar(500), -- ������������ ����������
    REK varchar(4000), -- ���������
    COST decimal(18, 2), -- ����
    KOLVO int, -- ����������
    SUMMA_RASH decimal(18, 2), -- �����, ������� �� ����� ���� �������������
    S_USER_ID int, -- ������������, �������� ���� ������ �����
    MOTIV varchar(4000), -- �����
		SUMMA_VID  decimal(18, 2), -- �����, ������� ���� ������
		VOZVR decimal(18, 2), -- �����, ������� ���� ����������
		RASHOD decimal(18, 2)	-- ������������� �� ����� - ����������� ������
  );
  print('Table O_RAS_DOK created');
end;

GO


GO

-- ����� ��� ��������, ������� � ����������� ������� 
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_REPORT_BIRTHDAY_CALL'
)
begin
  CREATE TABLE dbo.O_REPORT_BIRTHDAY_CALL (
    ID int identity NOT NULL primary key,
    D_START smalldatetime,
    USERID int, -- ������������ ������� ����� ������
    M_ORG_ID int, -- ����������� ������������
    O_ANK_ID int -- ������ �� ������ O_ANK.ID 
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

-- ��������� ������
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_KALEN_PROD_ID'
)
begin
	create sequence dbo.SQ_O_KALEN_PROD_ID start with 1 increment by 1 no cache;
end;

GO

-- ��������� ������, ���������� ������� A
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_KALEN_PROD'
)
begin
  CREATE TABLE dbo.O_KALEN_PROD (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_KALEN_PROD_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- ������������ ������� ����� ������
    M_ORG_ID int, -- ����������� ������������
    GOD int, -- ���, �� ������� ������������ ��������� ������
    MES int, -- �����, �� ������� ������������ ��������� ������
    NAME_AK varchar(500), -- ������������ �����
    M_PRODUCT_ID_TOVAR int, -- �����, ������ �� dbo.M_PRODUCT.ID
    M_PRODUCT_ID_PODAROK int, -- �������, ������ �� dbo.M_PRODUCT.ID
    COST decimal(18, 2), -- ����
    D_NAPOLN_S smalldatetime, -- ������ ��������� �
    D_NAPOLN_PO smalldatetime, -- ������ ��������� ��
    D_VLYUB_S smalldatetime, -- ������ �������� �
    D_VLYUB_PO smalldatetime, -- ������ �������� ��
    D_PROD_S smalldatetime, -- ������ ������ �
    D_PROD_PO smalldatetime, -- ������ ������ ��
    D_PERIOD_S as D_NAPOLN_S, -- ������ ��������� ������� (����������� ���� ��� ��������)
    D_PERIOD_PO as D_PROD_PO -- ����� ��������� ������� (����������� ���� ��� ��������)
  );
  print('Table O_KALEN_PROD created');
end;

GO

-- ���� - ��������
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_ZARPL_ID'
)
begin
	create sequence dbo.SQ_O_ZARPL_ID start with 1 increment by 1 no cache;
end;

GO

-- ���� - ��������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_ZARPL'
)
begin
  CREATE TABLE dbo.O_ZARPL (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_ZARPL_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- ������������ ������� ���� ������
    M_ORG_ID int, -- ����������� ������������
    D_PERIOD_S smalldatetime, -- ������ �
    D_PERIOD_PO smalldatetime -- ������ ��
  );
  print('Table O_ZARPL created');
end;

GO

-- ���� - �������� - ����������
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_ZARPL_FIO_ID'
)
begin
	create sequence dbo.SQ_O_ZARPL_FIO_ID start with 1 increment by 1 no cache;
end;

GO

-- ���� - �������� - ����������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_ZARPL_FIO'
)
begin
  CREATE TABLE dbo.O_ZARPL_FIO (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_ZARPL_FIO_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- ������������ ������� ����� ������
    M_ORG_ID int, -- ����������� ������������
    S_USER_ID int, -- ���������, ��� �������� ��������
    O_ZARPL_ID int, -- ������ �� dbo.O_ZARPL.ID
    DNI int, -- ���������� ������������ ����
    CHAS int, -- ���������� ������������ �����
    S_CH decimal(18, 2), -- �������� � ��� (������������� ��������������)
    SUMMA decimal(18, 2), -- ����� ������ �� ����
    VALOV_DOHOD decimal(18, 2), -- �������, ������� ����������� ���� ������� ������ �� ������
    PROTS decimal(18, 2), -- ������� �� �������, ������� ����� � ��������
    BONUS decimal(18, 2), -- �����, ����������� ����������
    SHTRAF decimal(18, 2), -- �����, ����������� ����������
    ZARPL decimal(18, 2) -- �������� ��������
  );
  print('Table O_ZARPL_FIO created');
end;

GO

-- ���� - ��������������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_INVENT'
)
begin
  CREATE TABLE dbo.O_INVENT (
    ID int NOT NULL PRIMARY KEY identity(1,1),
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- ������������ ������� ����� ������
    M_ORG_ID int, -- ����������� ������������
    NAME varchar(500), -- ��������
    KOLVO int,	-- ����������
    COST decimal(18, 2), -- ���������
    INV_NUM varchar(500), -- ����������� �����
    IS_SPISAN int default 0,	-- 0 - ��������, 1 - ������
    COMMENT varchar(4000), -- �����������
    PHOTO varbinary(max), -- ���� ����������� �������
    CHECK_PHOTO varbinary(max) -- ���� ���� ������� ����������� �������
  );
  print('Table O_INVENT created');
end;

GO

-- ����� A - �����
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_DILER_A_SKLAD_ID'
)
begin
	create sequence dbo.SQ_O_DILER_A_SKLAD_ID start with 1 increment by 1 no cache;
end;

GO

-- ����� A - �����
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_DILER_A_SKLAD'
)
begin
  CREATE TABLE dbo.O_DILER_A_SKLAD (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_DILER_A_SKLAD_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- ������������ ������� ����� ������
    M_ORG_ID int, -- ����� A, ������ �� dbo.M_ORG.ID
    M_PRODUCT_ID int, -- �����, ������ �� dbo.M_PRODUCT.ID
    KOLVO int -- ���������� ������ �� ������
  );
  print('Table O_DILER_A_SKLAD created');
end;

GO


-- ����� C - �����
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_DILER_C_SKLAD_ID'
)
begin
	create sequence dbo.SQ_O_DILER_C_SKLAD_ID start with 1 increment by 1 no cache;
end;

GO

-- ����� C - �����
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_DILER_C_SKLAD'
)
begin
  CREATE TABLE dbo.O_DILER_C_SKLAD (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_DILER_C_SKLAD_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- ������������ ������� ����� ������
    M_ORG_ID int, -- ����� C, ������ �� dbo.M_ORG.ID
    M_PRODUCT_ID int, -- �����, ������ �� dbo.M_PRODUCT.ID
    KOLVO int -- ���������� ������ �� ������
  );
  print('Table O_DILER_C_SKLAD created');
end;

GO


GO

-- ����� A - �����
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_DILER_A_PRICE_ID'
)
begin
	create sequence dbo.SQ_O_DILER_A_PRICE_ID start with 1 increment by 1 no cache;
end;

GO

-- ����� A - �����
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_DILER_A_PRICE'
)
begin
  CREATE TABLE dbo.O_DILER_A_PRICE (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_DILER_A_PRICE_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- ������������ ������� ����� ������
    M_ORG_ID int, -- ����� A, ������ �� dbo.M_ORG.ID
    M_PRODUCT_ID_TOVAR int, -- �����, ������ �� dbo.M_PRODUCT.ID
    D decimal(18, 2), -- ���� ��� ������ D
    ROZN decimal(18, 2), -- �������
    M_PRODUCT_ID_PODAROK int, -- �������, ������ �� dbo.M_PRODUCT.ID
    C decimal(18, 2) -- ���� ��� ������ C
  );
  print('Table O_DILER_A_PRICE created');
end;

GO

-- �������� ��� - ����� ��������
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_SMS_SEND_NUM'
)
begin
	create sequence dbo.SQ_O_SMS_SEND_NUM start with 1 increment by 1 no cache;
end;

GO

-- ������� ����������� �������� ���
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_SMS_SEND'
)
begin
  CREATE TABLE dbo.O_SMS_SEND (
    ID int NOT NULL PRIMARY KEY identity(1,1),
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- ������������, ������� �������� �������� S_USER.ID
    M_ORG_ID int, -- ����������� ������������ M_ORG.ID
    O_ANK_ID int,	-- ������ �� ������ O_ANK.ID
    SOOB varchar(4000), -- ���������
    SEND_DATE smalldatetime, -- ����-����� ��������
    SEND_LOGIN varchar(500), -- �����, � ������� �������� ���������� ��������� S_USER.LOGIN1
    SEND_STATE int, -- ������ ��������, 0 - �������� ��������, �� 1 �� 9 - ���� ������ �� M_SMS_SEND_ERROR.NAME
    SEND_NUM int, -- ���������� ����� ��������, ���� ������������ 100 ���, ����� �������� � ��� ����
    M_SMS_TEMPLATE_ID int -- ������ �� ������ �������������� �������� ��������� M_SMS_TEMPLATE.ID
  );
  print('Table O_SMS_SEND created');
end;

-- ������� ������ �������� ��� 
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_SMS_SEND_ERROR'
)
begin
  CREATE TABLE dbo.M_SMS_SEND_ERROR (
    ID int NOT NULL PRIMARY KEY identity(1,1),
    NAME varchar(4000) -- ������������
  );
  print('Table M_SMS_SEND_ERROR created');
end;

-- ������� ��������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_NASTR'
)
begin
  CREATE TABLE dbo.O_NASTR (
    ID int NOT NULL PRIMARY KEY identity(1,1),
    D_START smalldatetime,
    D_MODIF smalldatetime,
    USERID int, -- ������������, ������� �������� ������
    M_ORG_ID int, -- ����������� ������������ M_ORG.ID
    SMS_LOGIN varchar(500), -- ����� ��� ��� ��������
    SMS_PASSWORD varchar(500), -- ������ ��� ��� ��������
    SMS_SENDER varchar(500), -- ����������� ��� - ������ ���� ��������������� � http://smsc.ru/senders/ � ����������� ����������� ������� �� ������
    PHONE_MOBILE varchar(50),  -- ��������� ������� ��������������
    SIP_KEY varchar(500), -- ���� ��� �������
    SIP_SECRET varchar(500), -- ��������� ���� ��� �������
    DILER_C_ACCESS int not null default 0, -- 1 - ������ � ����� ��� ������ �, ���� ��� ����� � ���� ����������, 0 - ������
    VNESH_VID_REG varchar(500) not null default 'SO_SPISKOM_MEST', -- ������� ��� ������ �����������, ������ SO_SPISKOM_MEST - ������ ������� � SO_SPISKOM_FIO - ������ �������
    SHOW_KONT int not null default 1, -- 1 - ���������� �������� � ������ "������", 0 - ���
    SMS_AUTO_SEND int not null default 0 -- 1 - ������������ �������������� ���-��������, 0 - ���
  );
  print('Table O_NASTR created');
end;

GO

-- ���������� ��������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_DEISTV'
)
begin
  CREATE TABLE dbo.M_DEISTV (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500), -- ������������
    M_ORG_ID int -- ����������� ������������
  );
  print('Table M_DEISTV created');
end;

GO

-- ������ - ��������, ��� �������� ����������� � �������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_DEISTV'
)
begin
  CREATE TABLE dbo.O_DEISTV (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    D_START smalldatetime,
    D_FIN smalldatetime, -- ���� ����������� ��������
    M_ORG_ID int, -- ����������� ������������
    USERID int, -- ������������
    M_DEISTV_ID int, -- ������ �� M_DEISTV.ID, ��� ��������
    MESS varchar(4000), -- �������� ������
    O_ANK_ID int,
    O_SKLAD_PR_ID int,
    O_SKLAD_RAS_ID int,
    O_RAS_DOK_ID int
  );
  print('Table O_DEISTV created');
end;

GO

-- ������, ��� �����������
if not exists (
  select * from sys.sequences as s where s.name = 'SQ_O_UVEDOML_GR'
)
begin
	create sequence dbo.SQ_O_UVEDOML_GR start with 1 increment by 1 no cache;
end;

GO

-- ����������� � ��������������� ��������
if not EXISTS (
  SELECT * FROM information_schema.tables as t WHERE t.table_name = 'O_UVEDOML'
)
begin
	create table dbo.O_UVEDOML
	(
		ID int identity(1,1) primary key,
		FIO varchar(max),		-- ��� , ������ ������
		PHONE varchar(100),	-- �������, � ������, �� ���� ���������� ������
		O_ANK_ID int,			-- ������ �� ������
		M_VID_SOB_ID int,			-- �������, ���������� �� �������������� �����������, �������� � ������� ������ ���� M_VID_SOB.ID
		D_SOB smalldatetime,	-- ���� �������
		COMMENT varchar(max),	-- �����������
		ISP int default 0,		-- 0 - �������������, 1 - ���������
		D_START smalldatetime,
		D_MODIF smalldatetime,
		USERID int,
		M_ORG_ID int,
		O_SEANS_ID int,
		O_KONT_ANK_ID int,
    O_SKLAD_RAS_ID int, -- ������ �� dbo.O_SKLAD_RAS.ID, ���� ����������� ������� �� ������� �� ������
    GR int not null default 0, -- ������, ��������� ����������� ����� ������������ � ���� ������, � ��������� ��� ����� ��� ������ ������ �� ������, �������� ������ �� sequence SQ_O_UVEDOML_GR
    O_SKLAD_RAS_NOMER int -- ��� ������ ������ �� ������ �������� �� 5�� ����������� �����������, 1�� ��� �������, 2�� - 5�� ��� �������, � ���� ���� �������� ��������������� ����� 
	)
  print('Table O_UVEDOML created');
end;

GO

-- ����������� � ������� �����������
if not exists (
  select * from sys.sequences as s where s.name = 'SQ_O_UVEDOML_GR_COMMENT_ID'
)
begin
	create sequence dbo.SQ_O_UVEDOML_GR_COMMENT_ID start with 1 increment by 1 no cache;
end;

GO

-- ����������� � ������� �����������
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_UVEDOML_GR_COMMENT'
)
begin
  CREATE TABLE dbo.O_UVEDOML_GR_COMMENT (
    ID int not null primary key default next value for dbo.SQ_O_UVEDOML_GR_COMMENT_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    M_ORG_ID int, -- ����������� ������������, ���������� ����������� � �����������
    USERID int, -- ������������, ��������� ����������� � �����������
    O_UVEDOML_GR int, -- ������ �� dbo.O_UVEDOML.GR, ������ �����������
    O_UVEDOML_ID int, -- ������ �� dbo.O_UVEDOML.ID, �����������, �� �������� ������ �����������
    COMMENT varchar(4000) -- ����� �����������
    
  );
  print('Table O_UVEDOML_GR_COMMENT created');
end;

GO

GO

-- ���������� ��� ��������� � ������������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_VID_SOB'
)
begin
  CREATE TABLE dbo.M_VID_SOB (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500), -- ������������
    M_ORG_ID int -- ����������� ������������
  );
  print('Table M_VID_SOB created');
end;

GO

-- ���������� ��, ���
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_YES_NO'
)
begin
  CREATE TABLE dbo.M_YES_NO (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500) -- ������������
  );
  print('Table M_YES_NO created');
end;

GO

-- ���������� ��������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_VOPROS'
)
begin
  CREATE TABLE dbo.M_VOPROS (
    ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    NAME varchar(500), -- ������������
    M_ORG_ID int -- ����������� ������������
  );
  print('Table M_VOPROS created');
end;

GO

-- ������ - �������
if not EXISTS (
  SELECT * FROM information_schema.tables as t WHERE t.table_name = 'O_VOPROS'
)
begin
	create table O_VOPROS (
		ID int identity(1,1) primary key,
		M_VOPROS_ID int, -- ������ �� M_VOPROS.ID, ���������� ��������
		M_VOPROS_TAB_ID int, -- c����� �� �������, � ������� ��������� ������
		O_ANK_ID int, -- ������ �� ������ O_ANK.ID
		M_YES_NO_ID int, -- ���������� M_YES_NO.ID, ����� - ��/���
		COMMENT varchar(max), --�����������
    D_START smalldatetime, -- ���� ����� ������
    D_MODIF smalldatetime, -- ���� ��������������
    M_ORG_ID int, -- ����������� ������������
    USERID int -- ������������
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

-- ���������� ������� � ������ - �������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_VOPROS_TAB'
)
begin
  CREATE TABLE dbo.M_VOPROS_TAB (
    ID int NOT NULL PRIMARY KEY,
    NAME varchar(500), -- ������������
    M_ORG_ID int -- ����������� ������������
  );
  print('Table M_VOPROS_TAB created');
end;

GO


-- �������
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_VIPIS_ID'
)
begin
	create sequence dbo.SQ_O_VIPIS_ID start with 1 increment by 1 no cache;
end;

GO

-- �������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_VIPIS'
)
begin
  CREATE TABLE dbo.O_VIPIS (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_VIPIS_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    M_ORG_ID int, -- ����������� ������������
    USERID int, -- ������������
    O_ANK_ID int, -- ������ �� ������ O_ANK.ID
    M_ZABOL_GROUP_ID int, -- ������, ������ �� M_ZABOL_GROUP.ID
    ZABOL_TEXT varchar(4000), -- ������������ �������� �����������
    ULUCH_TEXT varchar(4000), -- ������������ ��������� ���������
    D_ULUCH smalldatetime, -- ���� ���������
    LINK varchar(4000), -- ������ �� ����� � Youtube.com, ���������� �� ������ ���������
    LINK_POSLE varchar(4000) -- ������ �� ����� � Youtube.com, ���������� ����� ������ ���������
  );
  print('Table O_VIPIS created');
end;


-- ������� - ����� �������
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_VIPIS_FILE_ZABOL_ID'
)
begin
	create sequence dbo.SQ_O_VIPIS_FILE_ZABOL_ID start with 1 increment by 1 no cache;
end;

GO

-- ������� - ����� �������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_VIPIS_FILE_ZABOL'
)
begin
  CREATE TABLE dbo.O_VIPIS_FILE_ZABOL (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_VIPIS_FILE_ZABOL_ID,
    D_START smalldatetime,
    M_ORG_ID int, -- ����������� ������������
    USERID int, -- ������������
    O_VIPIS_ID int, -- ������ �� ������� dbo.O_VIPIS.ID
    FNAME varchar(4000), -- ��� �����, ������ ���, ��� ����
    F varbinary(max) -- ��� �������� ����
  );
  print('Table O_VIPIS_FILE_ZABOL created');
end;


-- ������� - ����� ���������
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_VIPIS_FILE_ULUCH_ID'
)
begin
	create sequence dbo.SQ_O_VIPIS_FILE_ULUCH_ID start with 1 increment by 1 no cache;
	print('Sequence SQ_O_VIPIS_FILE_ULUCH_ID created');
end;

GO

-- ������� - ����� ���������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_VIPIS_FILE_ULUCH'
)
begin
  CREATE TABLE dbo.O_VIPIS_FILE_ULUCH (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_VIPIS_FILE_ULUCH_ID,
    D_START smalldatetime,
    M_ORG_ID int, -- ����������� ������������
    USERID int, -- ������������
    O_VIPIS_ID int, -- ������ �� ������� dbo.O_VIPIS.ID
    FNAME varchar(4000), -- ��� �����, ������ ���, ��� ����
    F varbinary(max) -- ��� �������� ����
  );
  print('Table O_VIPIS_FILE_ULUCH created');
end;


-- ��������� � ������ �������
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_VIPIS_ULUCH_ID'
)
begin
	create sequence dbo.SQ_O_VIPIS_ULUCH_ID start with 1 increment by 1 no cache;
	 print('Sequence SQ_O_VIPIS_ULUCH_ID created');
end;

GO

-- ��������� � ������ �������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_VIPIS_ULUCH'
)
begin
  CREATE TABLE dbo.O_VIPIS_ULUCH (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_VIPIS_ULUCH_ID,
    D_START smalldatetime,
    M_ORG_ID int, -- ����������� ������������
    USERID int, -- ������������
    O_VIPIS_ID int, -- ������ dbo.O_VIPIS.ID
    M_ZABOL_ID int not null -- ����������� �� �������� ���������, ������ �� M_ZABOL.ID
  );
  print('Table O_VIPIS_ULUCH created');
end;



GO


-- ������
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_ZADACHA_ID'
)
begin
	create sequence dbo.SQ_O_ZADACHA_ID start with 1 increment by 1 no cache;
end;

GO

-- ������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_ZADACHA'
)
begin
  CREATE TABLE dbo.O_ZADACHA (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_ZADACHA_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    M_ORG_ID int, -- ����������� ������������, ���������� ������
    USERID int, -- ������������, ��������� ������
    M_ORG_ID_ZADACHA int, -- �����������, �� ������� �������� ������
    D_BEG smalldatetime, -- ���� �������� ������ �
    D_END smalldatetime, -- ���� �������� ������ ��
    TEMA varchar(500), -- ���� ������
    ZADACHA varchar(4000), -- ���������� ������
    D_VIP smalldatetime, -- ���� ���������� ������
    USERID_VIP int -- ��� �������� ������
  );
  print('Table O_ZADACHA created');
end;

GO

-- ����������
if not EXISTS (
  select * from sys.sequences as s where s.name = 'SQ_O_OPOV_ID'
)
begin
	create sequence dbo.SQ_O_OPOV_ID start with 1 increment by 1 no cache;
end;

GO

-- ����������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'O_OPOV'
)
begin
  CREATE TABLE dbo.O_OPOV (
    ID int NOT NULL PRIMARY KEY default next value for dbo.SQ_O_ZADACHA_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    M_ORG_ID int, -- ����������� ������������, ������������� ����������
    M_ORG_ID_SOURCE int, -- ��� TIP = 1, �����������, � ������� ��� ���� ������ � ����� �������
    USERID int, -- ������������, ��������������� ����������
    O_ANK_ID int, -- ������ �� ������, dbo.O_ANK.ID
    O_ANK_ID_SOURCE int, -- ��� TIP = 1, ������ � ����� �� �������, �� � ������ �����������
    O_SKLAD_RAS_ID int, -- ������ �� ������ �� ������, dbo.O_SKLAD_RAS.ID
    O_SKLAD_RAS_PRODUCT_ID int, -- ������ �� �����, ������� ��� ������ �� ���������� ���� dbo.O_SKLAD_RAS_PRODUCT.ID
    TIP int not null default 0, -- 1 - ��������������� �������, ������� ��� ��� ��������������� � ������ ������
                                -- 2 - ���-�� ������ ����� �������, ��� �� ����� � ������ A
    M_ORG_ID_A int -- ��� TIP = 2, ������ �� ������ A, � ������� ������������ ����, dbo.M_ORG.ID
  );
  print('Table O_OPOV created');
end;

GO

-- c��������� �������� ��� ���������
if not exists (
  select * from information_schema.tables as t where t.table_name = 'M_KONT_STATUS'
)
begin
  create table dbo.M_KONT_STATUS (
    ID int identity(1,1) not null primary key,
    NAME varchar(500), -- ������������
    M_ORG_ID int -- ����������� ������������
  );
  print('Table M_KONT_STATUS created');
end;


GO

-- c��������� ���������� ��� ���������
if not exists (
  select * from information_schema.tables as t where t.table_name = 'M_KONT_IST'
)
begin
  create table dbo.M_KONT_IST (
    ID int identity(1,1) not null primary key,
    NAME varchar(500), -- ������������
    M_ORG_ID int -- ����������� ������������
  );
  print('Table M_KONT_IST created');
end;

GO


-- ���������� ������ ������������ � ������ ��������
if not exists (
  select * from sys.sequences as s where s.name = 'SQ_O_KONT_STAT_ID'
)
begin
	create sequence dbo.SQ_O_KONT_STAT_ID start with 1 increment by 1 no cache;
end;

GO

-- ���������� ������ ������������ � ������ ��������
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_KONT_STAT'
)
begin
  create table dbo.O_KONT_STAT (
    ID int not null primary key default next value for dbo.SQ_O_KONT_STAT_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    M_ORG_ID int, -- ����������� ������������, ����������� �������
    USERID int, -- ������������, ���������� �������
    TIP_IZM int, -- ��� ���������, ������� ������ ������������: 1 - ������, 2 - ������ �������, 3 - �������� �����������, 4 - ������ ������, 5 - ������ ��������
    M_KONT_STATUS_ID int null, -- ����������� ��� TIP_IZM = 4 - ������ �������� ����� ���������, ������ �� dbo.M_KONT_STATUS.ID
    M_KONT_IST_ID int null -- ����������� ��� TIP_IZM = 5 - �������� �������� ����� ���������, ������ �� dbo.M_KONT_IST.ID
  );
  print('Table O_KONT_STAT created');
end;

GO

-- ������������� - ����� ������
if not exists (
  select * from information_schema.tables as t where t.table_name = 'M_SOPR_FORM_OPL'
)
begin
  create table dbo.M_SOPR_FORM_OPL (
    ID int identity(1,1) not null primary key,
    NAME varchar(500), -- ������������
    M_ORG_ID int -- ����������� ������������
  );
  print('Table M_SOPR_FORM_OPL created');
end;

GO

-- ������������� - �������
if not exists (
  select * from information_schema.tables as t where t.table_name = 'M_SOPR_PRODUCT'
)
begin
  create table dbo.M_SOPR_PRODUCT (
    ID int identity(1,1) not null primary key,
    NAME varchar(500), -- ������������
    M_ORG_ID int -- ����������� ������������
  );
  print('Table M_SOPR_PRODUCT created');
end;

GO

-- ������������� - �������
if not exists (
  select * from information_schema.tables as t where t.table_name = 'M_SOPR_STATUS'
)
begin
  create table dbo.M_SOPR_STATUS (
    ID int identity(1,1) not null primary key,
    NAME varchar(500), -- ������������
    M_ORG_ID int -- ����������� ������������
  );
  print('Table M_SOPR_STATUS created');
end;


GO

-- ����������� ��� ������ ������ ��������
if not exists (
  select * from sys.sequences as s where s.name = 'SQ_O_KONT_SEANS_COMMENT_ID'
)
begin
	create sequence dbo.SQ_O_KONT_SEANS_COMMENT_ID start with 1 increment by 1 no cache;
end;

GO

-- ����������� ��� ������ ������ ��������
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_KONT_SEANS_COMMENT'
)
begin
  create table dbo.O_KONT_SEANS_COMMENT (
    ID int not null primary key default next value for dbo.SQ_O_KONT_SEANS_COMMENT_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    M_ORG_ID int, -- ����������� ������������, ���������� �������
    USERID int, -- ������������, ��������� �������
    O_KONT_SEANS_ID int, -- ������ �� �����, dbo.O_KONT_SEANS.ID
    COMMENT varchar(max) -- �����������
  );
  print('Table O_KONT_SEANS created');
end;

GO

-- �������������
if not exists (
  select * from sys.sequences as s where s.name = 'SQ_O_SOPR_COMMENT_ID'
)
begin
	create sequence dbo.SQ_O_SOPR_COMMENT_ID start with 1 increment by 1 no cache;
end;

GO

-- �������������
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_SOPR'
)
begin
  create table dbo.O_SOPR (
    ID int identity(1,1) not null primary key,
    D_START smalldatetime,
    M_ORG_ID int, -- ����������� ������������, ���������� ������
    USERID int, -- ������������, ��������� ������
    M_SOPR_PRODUCT_ID int, -- ������ �� �������, dbo.M_SOPR_PRODUCT.ID
		M_SOPR_FORM_OPL_ID int, -- ������ �� ����� ������, dbo.M_SOPR_FORM_OPL.ID
		M_SOPR_STATUS_ID int, -- ������ �� ������, dbo.M_SOPR_STATUS.ID
		M_SOPR_DOP_ID int, -- c������ �� ���. ������ dbo.M_SOPR_DOP.ID
		O_ANK_ID int, -- ������ �� ������ O_ANK.ID
		IS_SROCHNO int not null default 0
  );
  print('Table O_SOPR created');
end;

-- ������������� - �����������
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_SOPR_COMMENT'
)
begin
  create table dbo.O_SOPR_COMMENT (
    ID int not null primary key default next value for dbo.SQ_O_SOPR_COMMENT_ID,
    D_START smalldatetime,
    M_ORG_ID int, -- ����������� ������������, ���������� ������
    USERID int, -- ������������, ��������� ������
		O_SOPR_ID int, -- ������ �� ������������� O_SOPR.ID
    COMMENT varchar(max), -- �����������
		ZADACHA varchar(1000) -- ������
  );
  print('Table O_SOPR_COMMENT created');
end;

-- ������������� - ���. ������
if not exists (
  select * from information_schema.tables as t where t.table_name = 'M_SOPR_DOP'
)
begin
  create table dbo.M_SOPR_DOP (
    ID int identity(1,1) not null primary key,
    NAME varchar(500), -- ������������
    M_ORG_ID int -- ����������� ������������
  );
  print('Table M_SOPR_DOP created');
end;

GO

-- ���������
if not exists (
  select * from sys.sequences as s where s.name = 'SQ_O_PRODL_COMMENT_ID'
)
begin
	create sequence dbo.SQ_O_PRODL_COMMENT_ID start with 1 increment by 1 no cache;
end;

GO

-- ���������
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_PRODL'
)
begin
  create table dbo.O_PRODL (
    ID int identity(1,1) not null primary key,
    D_START smalldatetime,
    M_ORG_ID int, -- ����������� ������������, ���������� ������
    USERID int, -- ������������, ��������� ������
		M_SOPR_STATUS_ID int, -- ������ �� ������, dbo.M_SOPR_STATUS.ID
		M_SOPR_DOP_ID int, -- c������ �� ���. ������ dbo.M_SOPR_DOP.ID
		O_ANK_ID int, -- ������ �� ������ O_ANK.ID
		IS_SROCHNO int not null default 0
  );
  print('Table O_PRODL created');
end;

GO

-- ��������� - �����������
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_PRODL_COMMENT'
)
begin
  create table dbo.O_PRODL_COMMENT (
    ID int not null primary key default next value for dbo.SQ_O_PRODL_COMMENT_ID,
    D_START smalldatetime,
    M_ORG_ID int, -- ����������� ������������, ���������� ������
    USERID int, -- ������������, ��������� ������
		O_PRODL_ID int, -- ������ �� ��������� O_PRODL.ID
    COMMENT varchar(max), -- �����������
		ZADACHA varchar(1000) -- ������
  );
  print('Table O_PRODL_COMMENT created');
end;

GO

-- ���������
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_MOTIV'
)
begin
  create table dbo.O_MOTIV (
    ID int identity(1,1) not null primary key,
    D_BEG smalldatetime,
		D_END smalldatetime,
    M_ORG_ID int, -- ����������� ������������, ���������� ������
    USERID int, -- ������������, ��������� ������
		SUMMA numeric(15,2), -- ����� ����� �� ������
		PROCENT numeric(15,2) -- ������� �� ����� ��� ��������, ��� ���� ����������� ���������� ��������
  );
  print('Table O_MOTIV created');
end;

GO

-- ������� ����� �������� ��� 
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_SMS_TEMPLATE_TYPE'
)
begin
  CREATE TABLE dbo.M_SMS_TEMPLATE_TYPE (
    ID int NOT NULL PRIMARY KEY identity(1,1),
    NAME varchar(1000), -- ������������
    M_ORG_ID int -- ����������� ������������, ���������� ������ - �� �����������, ���� ����� ��� ����
  );
  print('Table M_SMS_TEMPLATE_TYPE created');
end;

GO

-- ������� �������� ��� 
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_SMS_TEMPLATE'
)
begin
  CREATE TABLE dbo.M_SMS_TEMPLATE (
    ID int NOT NULL PRIMARY KEY identity(1,1),
    M_SMS_TEMPLATE_TYPE_ID int, -- ��� ��� ������� M_SMS_TEMPLATE_TYPE.ID
    SOOB varchar(4000), -- ����� ������� ���
    M_ORG_ID int -- ����������� ������������, ���������� ������ - ������� ���������� ������ �� ����� �����������
  );
  print('Table M_SMS_TEMPLATE created');
end;


GO

-- ������������ ���������� (���������)
if not exists (
  select * from sys.sequences as s where s.name = 'SQ_O_ABON_PRIOST_ID'
)
begin
	create sequence dbo.SQ_O_ABON_PRIOST_ID start with 1 increment by 1 no cache;
end;

GO

-- ������������ ���������� (���������)
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_ABON_PRIOST'
)
begin
  create table dbo.O_ABON_PRIOST (
    ID int not null primary key default next value for dbo.SQ_O_ABON_PRIOST_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    M_ORG_ID int, -- ����������� ������������, ���������� �������
    USERID int, -- ������������, ��������� �������
    O_ANK_ID int, -- ������ �� ������, dbo.O_ANK.ID
    O_SKLAD_RAS_PRODUCT_ID int, -- ���������������� ���������, ������ �� dbo.O_SKLAD_RAS_PRODUCT.ID
    D_PRIOST_S smalldatetime, -- ���� ������������ ���������� �
    D_PRIOST_PO smalldatetime -- ���� ������������ ���������� ��
  );
  print('Table O_ABON_PRIOST created');
end;


-- ������� ���������� (������������) ������� ��� ������
if not EXISTS (
  select * from information_schema.tables as t where t.table_name = 'M_PRODUCT_ORG'
)
begin
  CREATE TABLE dbo.M_PRODUCT_ORG (
    ID int NOT NULL PRIMARY KEY identity(1,1),
    M_PRODUCT_ID int, -- ������ �� dbo.M_PRODUCT.ID - �����, ������� ������������ � �����������
    M_ORG_ID int -- �����������, ��� ������� ������ �����
  );
  print('Table M_PRODUCT_ORG created');
end;

GO

-- ��������� (����������) ���������� ��������� �� ���������� � ���. ��������
if not exists (
  select * from sys.sequences as s where s.name = 'SQ_O_ABON_DOP_USL_IZM_ID'
)
begin
	create sequence dbo.SQ_O_ABON_DOP_USL_IZM_ID start with 1 increment by 1 no cache;
end;

GO

-- ��������� (����������) ���������� ��������� �� ���������� � ���. ��������
if not exists (
  select * from information_schema.tables as t where t.table_name = 'O_ABON_DOP_USL_IZM'
)
begin
  create table dbo.O_ABON_DOP_USL_IZM (
    ID int not null primary key default next value for dbo.SQ_O_ABON_DOP_USL_IZM_ID,
    D_START smalldatetime,
    D_MODIF smalldatetime,
    M_ORG_ID int, -- ����������� ������������, ������������ ��������� ����������
    USERID int, -- ������������, ����������� ��������� ����������
    O_ANK_ID int, -- ������ �� ������, dbo.O_ANK.ID
    O_SKLAD_RAS_PRODUCT_ID int, -- �� ����� ���. ������ ��������� ���������� ����������, ������ �� dbo.O_SKLAD_RAS_PRODUCT.ID
    D_IZM smalldatetime -- ���� ���������� ����������
  );
  print('Table O_ABON_DOP_USL_IZM created');
end;

GO

