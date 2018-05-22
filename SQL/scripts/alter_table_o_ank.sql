-- ������
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
    GPS_LT decimal(12, 8) -- ���������� ����� ������, ������ (latitude)
  );
  print('Table O_ANK created');
end;