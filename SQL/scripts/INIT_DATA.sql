truncate table dbo.m_zabol;
set identity_insert dbo.m_zabol on;
insert into dbo.m_zabol (id, name) values 
                  ( 1, '������������' ),
                  ( 2, '����������' ),
                  ( 3,  '������' ),
                  ( 4,  '������������' ),
                  ( 5, '�������� ������' ),
                  ( 6, '�������' )
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
select 1, '1-� ���' union all
select 2, '2-� ���'

set identity_insert dbo.m_ryad off;

GO

truncate table dbo.m_ist_inf;
set identity_insert dbo.m_ist_inf on;
insert into dbo.m_ist_inf (id, name)
select 1,  '���������'     union all
select 2,  '����������'    union all
select 3,  '��� ������'    union all
select 4,  '����������'    union all
select 5,  '��������'      union all
select 6,  '������'        union all
select 7,  '��������'      union all
select 8,  '����������'


set identity_insert dbo.m_ist_inf off;


GO

truncate table dbo.m_sex;
set identity_insert dbo.m_sex on;
insert into dbo.m_sex (id, name)
select 1,  '�������'     union all
select 2,  '�������'


set identity_insert dbo.m_sex off;

GO

truncate table dbo.m_product;
set identity_insert dbo.m_product on;
insert into m_product(id, name)
select 1, '��������' union all
select 2, '���' union all
select 3, '���';

set identity_insert dbo.m_product off;

GO

truncate table dbo.m_service_type;
set identity_insert dbo.m_service_type on;
insert into m_service_type(id, name)
select 1, '����' union all
select 2, '�� ������' union all
select 3, '��������' union all
select 4, '������';

set identity_insert dbo.m_service_type off;

GO

truncate table dbo.s_user_role;
set identity_insert dbo.s_user_role on;
insert into s_user_role(id, name, m_org_id)
select 1 id, '������', 1 name union all
select 2 id, '�����������', 1 name union all
select 3 id, '����������', 1 name union all
select 4 id, '�����������', 1 name union all
select 5 id, '��������', 1 name union all
select 6 id, '����� D', 1 name union all
select 7 id, '����� �', 1;

set identity_insert dbo.s_user_role off;

GO

truncate table dbo.m_manual;
set identity_insert dbo.m_manual on;
insert into m_manual(id, name_ru, name_eng)
select 1, '������ �����������', 'M_ZABOL_GROUP' union all
select 2, '������ ������������', 'M_RYAD' union all
select 3, '��������� �� �������', 'M_PRICH_ISKL' union all
select 4, '��������� �����������', 'M_IST_INF' union all
select 5, '����� ������', 'M_METOD_OPL' union all
select 6, '�����������', 'S_USER_ROLE' union all
select 7, '�������', 'M_STATUS' union all
select 8, '������� �������', 'M_SERVICE_TYPE' union all
select 9, '������ �������', 'M_RASHOD_STAT' union all
select 10, '���� ������������', 'M_PRODUCT' union all
select 11, '��������', 'M_DEISTV' union all
select 12, '��� �����������', 'M_VID_SOB' union all
select 13, '���������� ��������', 'M_VOPROS' union all
select 14, '������ ��������', 'M_KONT_STATUS' union all
select 15, '�������� ��������', 'M_KONT_IST' union all
select 16, '������������� - ����� ������', 'M_SOPR_FORM_OPL' union all
select 17, '������������� - �������', 'M_SOPR_PRODUCT' union all
select 18, '������������� - �������', 'M_SOPR_STATUS' union all
select 19, '������������� - ���. ������', 'M_SOPR_DOP' union all
select 20, '��� �������� ���', 'M_SMS_TEMPLATE_TYPE';
set identity_insert dbo.m_manual off;

GO


truncate table dbo.m_org;
alter sequence dbo.sq_m_org_id restart;
insert into dbo.m_org(ID, NAME, PARENT_ID, ADRES, PHONE, KOD_PODTV, M_ORG_TYPE_ID)
select (next value for dbo.sq_m_org_id) ID, '�������������' NAME, 0 PARENT_ID, '��. �����-�� ��� 17 ������ 3' ADRES, '938402384' PHONE, '1234' KOD_PODTV, 1 M_ORG_TYPE_ID;


GO

truncate table dbo.m_zabol_group;
insert into dbo.M_ZABOL_GROUP (NAME, M_ORG_ID)
--select '������-������������ �������' name, 2 m_org_id union all
--select '�������� �������' name, 2 m_org_id union all
--select '�����-���������� �������' name, 2 m_org_id union all
--select '������������� �������' name, 2 m_org_id union all
--select '������� �������' name, 2 m_org_id union all
--select '����������� �������' name, 2 m_org_id union all
--select '��������-���������� �������' name, 2 m_org_id union all
--select '������� �����������' name, 2 m_org_id union all
--select '����������� �������' name, 2 m_org_id union all
--select '����������� �������' name, 2 m_org_id union all
--select '�������, �������������� ���������' name, 2 m_org_id union all
--select '������� ������� ������' name, 2 m_org_id;
select '������� ������� ������' name, 2 m_org_id union all
select '����������� �������' name, 2 m_org_id union all
select '������� �������' name, 2 m_org_id union all
select '����������� �������' name, 2 m_org_id union all
select '��������-���������� �������' name, 2 m_org_id union all
select '���, ����������� �������' name, 2 m_org_id union all
select '������� �����������' name, 2 m_org_id union all
select '������ ����������� � ���������' name, 2 m_org_id union all
select '��������, ��������' name, 2 m_org_id union all
select '�������, �����, �����' name, 2 m_org_id union all
select '������ �����������' name, 2 m_org_id union all
select '������� �����������' name, 2 m_org_id union all
select '������� �����������' name, 2 m_org_id;

GO

truncate table dbo.m_org_type;
set identity_insert dbo.m_org_type on;
insert into dbo.m_org_type(ID, NAME)
select 1 ID, '�������������' NAME union all
select 2 ID, '����� A' NAME union all
select 3 ID, '����� C' NAME union all
select 4 ID, '����� D' NAME union all
select 5 ID, '���. �����' NAME;

set identity_insert dbo.m_org_type off;

GO

truncate table dbo.M_PRICH_ISKL;
INSERT INTO dbo.M_PRICH_ISKL VALUES (1, '��� �������', 1);
INSERT INTO dbo.M_PRICH_ISKL VALUES (2, '�������', 1);
INSERT INTO dbo.M_PRICH_ISKL VALUES (3, '� �������', 1);
INSERT INTO dbo.M_PRICH_ISKL VALUES (4, '������', 1);
INSERT INTO dbo.M_PRICH_ISKL VALUES (5, '��������', 1);
INSERT INTO dbo.M_PRICH_ISKL VALUES (6, '����������', 1);
INSERT INTO dbo.M_PRICH_ISKL VALUES (7, '������', 1);
INSERT INTO dbo.M_PRICH_ISKL VALUES (8, '������ �� �������', 1);

GO

truncate table dbo.m_metod_opl;
insert into dbo.m_metod_opl (NAME, M_ORG_ID)
select '��������' name, 2 m_org_id union all
select '�����������' name, 2 m_org_id;

GO

truncate table dbo.m_status;
insert into dbo.m_status (NAME, M_ORG_ID)
select '���� ������?' name, 2 m_org_id union all
select '������������� ����������' name, 2 m_org_id union all
select '���� �����������' name, 2 m_org_id union all
select '������' name, 2 m_org_id union all
select '���������' name, 2 m_org_id union all
select '������� ������������' name, 2 m_org_id union all
select '�������' name, 2 m_org_id union all
select '����� � ������ ������' name, 2 m_org_id union all
select '�������� ������' name, 2 m_org_id union all
select '�����' name, 2 m_org_id union all
select '����������', 2;

GO

truncate table dbo.m_rashod_stat;
insert into dbo.m_rashod_stat (NAME)
select '������' union all
select '��������' union all
select '��������' union all
select '�������' union all
select '������' union all
select '���������' union all
select '�������������������' union all
select '��������' union all
select '��������' union all
select '������������ ������' union all
select '������������' union all
select '������' union all
select '��������� ���������' union all
select '����������' union all
select '������� �����' union all
select '������ �����' union all
select '����������';

GO

truncate table dbo.m_pravo_gr;
set identity_insert dbo.m_pravo_gr on;
insert into dbo.m_pravo_gr(id, name)
select 1,	'������ �����' union
select 2,	'�����������' union
select 3,	'�����������' union
select 4,	'������' union
select 5,	'����' union
select 6,	'������' union
select 7,	'��������' union
select 8,	'����' union
select 9,	'����������' union
select 10, '������' union
select 11, '�������������' union
select 12, '���������' union
select 13, '�������';
set identity_insert dbo.m_pravo_gr off;

GO

truncate table dbo.m_pravo_rej;
set identity_insert dbo.m_pravo_rej on;
insert into dbo.m_pravo_rej(id, name, m_pravo_gr_id)
-- ������
select	1	,	 '������', 1	union
select	2	,	 '������', 1	union
select	3	,	 '�������', 1	union
select	4	,	 '����������', 1	union
select	5	,	 '�������', 1	union
select	6	,	 '�������', 1	union
select	7	,	 '������', 1	union
select	8	,	 '������', 1	union
select	9	,	 '������', 1	union
-- ������
select	10,	 '����� ����������', 4	union
select	11,	 '�����������', 4	union
select	12,	 '�����������', 4	union
select	13,	 '���������', 4	union
select	14,	 '��� ��������', 4	union
select	15,	 '�����', 4	union
select	16,	 '�������', 4	union
select	17,	 '�����', 4	union
select	18,	 '������', 4	union
select	19,	 '������������� ���������', 4	union
-- �����������
select	20,	 '', 2	union
-- �����������
select	21,	 '', 3	union
-- ����
select	22,	 '', 5	union
-- ������
select	23,	 '', 6	union
-- ��������
select	24,	 '������', 7	union
-- �����
select  25,  '������ �� �����', 8 union
select  26,  '�����', 8 union
select  27,  '������ �� ������', 8 union
select  28,  '��������� ���������', 8 union

-- ���� - ������
select  29,  '������ - ������ �����������', 8 union
select  30,  '������ - ����������� �������������', 8 union
select  31,  '������ - ������ �������', 8 union
select  32,  '������ - ����� � �������', 8 union
select  33,  '������ - ����� �� ������', 8 union

-- �����
select  34,  '��������', 8 union
select  35,  '��������������', 8 union

-- ����������
select	36,	 '', 9	union

-- ������
select	37,	 '��������', 10 union

-- ����
select  38,  '�������� �� ������', 8 union
select  39,  '����������� ������� �� ������', 8 union
select  40,  '������ �� ����� - �������������', 8 union
-- ��������
select	41,	 '�����������', 7	union
select	42,	 '�������', 7	union
select	43,	 '���������������', 7 union
-- ������
select	44,	 '����', 4	union
select	45,	 '�������', 4 union
select	46	,'�������� ���', 1 union
-- ������
select	47,	 '�����������', 10 union
select	48,	 '����', 10 union
-- ��� ����� ��� �����������
select	49,	 '����������� - ���������', 10 union
select	50,	 '����������� - ���������������', 10 union
select	51,	 '����������� - �����������', 10 union
select	52,	 '����������� - �� �����������', 10 union
-- ������ - �����������
select	53,	 '�����������', 4 union
-- �������� - ����������
select	54,	 '����������', 7 union
-- �������������
select  55, '�������������', 11 union
select  56, '���������', 12 union
-- ���� - ������
select  57, '������ - �� �������', 8 union
select  58, '������ - �����', 8 union
-- �������
select 59, '��������� �������', 13 union
-- ���� - �� �����
select  60, '������ - �� �����', 8 union
-- ������ �� ������ - ���������� ���������
select 61, '������ �� ���. - ���-�� �����.', 8 union
-- ������ �� ������ - ���� �����������
select 62, '������ �� ���. - ����', 8  union
-- ������ �� ������ - ���� ��������
select 63, '������ �� ���. - ���� ��������', 8
;
set identity_insert dbo.m_pravo_rej off;

GO

truncate table dbo.m_sms_send_error;
set identity_insert dbo.m_sms_send_error on;
insert into dbo.m_sms_send_error(id, name)
select 1,	'������ � ����������' union
select 2,	'�������� ����� ��� ������' union
select 3,	'������������ ������� �� ����� �������' union
select 4,	'IP-����� �������� ������������ ��-�� ������ ������ � ��������' union
select 5,	'�������� ������ ����' union
select 6,	'��������� ��������� (�� ������ ��� �� ����� �����������)' union
select 7,	'�������� ������ ������ ��������' union
select 8,	'��������� �� ��������� ����� �� ����� ���� ����������' union
select 9,	'�������� ����� ������ ����������� ������� �� �������� SMS-��������� ���� ����� ���� ���������� �������� �� ��������� ��������� ��������� � ������� ������';
set identity_insert dbo.m_sms_send_error off;

GO

truncate table dbo.m_deistv;
set identity_insert dbo.m_deistv on;
insert into m_deistv(id, name, m_org_id)
select 1, '������', 1 union all
select 2, '�������', 1 union all
select 3, '������', 1 union all
select 4, '������', 1 union all
select 5, '��������', 1 union all
select 6, '����', 1 union all
select 7, '�������', 1 union all
select 8, '������', 1 union all
select 9, '����� �����-����', 1;
set identity_insert dbo.m_deistv off;

GO

truncate table dbo.m_yes_no;
set identity_insert dbo.m_yes_no on;
insert into m_yes_no(id, name)
select 1, '��' union all
select 2, '���';
set identity_insert dbo.m_yes_no off;

GO

truncate table dbo.m_vid_sob;
set identity_insert dbo.m_vid_sob on;
insert into m_vid_sob(id, name)
select 1, '������' union all
select 2, '�����������' union all
select 3, '�� ���������' union all
select 4, '���� ��������' union all
select 5, '�������';
set identity_insert dbo.m_vid_sob off;





GO

truncate table dbo.M_KONT_STATUS;

GO

set identity_insert dbo.M_KONT_STATUS on;
insert into dbo.M_KONT_STATUS (ID, NAME, M_ORG_ID) values (1, '<�� �����>', 2), (2, '������', 2), (3, '��.�����', 2), (4, '�����������', 2), (5, '�����', 2);
set identity_insert dbo.M_KONT_STATUS off;

GO




GO

truncate table dbo.M_KONT_IST;

GO

set identity_insert dbo.M_KONT_IST on;
insert into dbo.M_KONT_IST (ID, NAME, M_ORG_ID) values (1, '<�� �����>', 2), (2, '��������', 2);
set identity_insert dbo.M_KONT_IST off;

GO

truncate table dbo.M_SOPR_FORM_OPL;
set identity_insert dbo.M_SOPR_FORM_OPL on;
insert into dbo.M_SOPR_FORM_OPL (ID, NAME, M_ORG_ID)
values (1, '������',    2), 
			 (2, '�������',   2),
			 (3, '��������',  2),
			 (4, '���������', 2);  
set identity_insert dbo.M_SOPR_FORM_OPL off;

GO

truncate table dbo.M_SOPR_PRODUCT;
set identity_insert dbo.M_SOPR_PRODUCT on;
insert into dbo.M_SOPR_PRODUCT (ID, NAME, M_ORG_ID)
values (1, '1 ���',  2),
			 (2, '3 ���',  2),
			 (3, '6 ���',  2),
			 (4, '9 ���',  2),
			 (5, '12 ���', 2);
set identity_insert dbo.M_SOPR_PRODUCT off;

GO

truncate table dbo.M_SOPR_STATUS;
set identity_insert dbo.M_SOPR_STATUS on;
insert into dbo.M_SOPR_STATUS (ID, NAME, M_ORG_ID)
values (1,  '�����',   2),
			 (2,  '�������', 2),
			 (3,  '�����',   2),
			 (4,  '������',  2),
			 (5,  '�����',   2),
			 (6,  '����',    2),
			 (7,  '�����',   2),
			 (8,  '����',    2),
			 (9,  '�/�',     2)
set identity_insert dbo.M_SOPR_STATUS off;

GO

truncate table dbo.M_SOPR_DOP;
set identity_insert dbo.M_SOPR_DOP on;
insert into dbo.M_SOPR_DOP (ID, NAME, M_ORG_ID)
values (1,  '����.',   2),
			 (2,  '����.',  2);
set identity_insert dbo.M_SOPR_DOP off;

GO

truncate table dbo.M_SMS_TEMPLATE_TYPE;
set identity_insert dbo.M_SMS_TEMPLATE_TYPE on;
insert into dbo.M_SMS_TEMPLATE_TYPE (ID, NAME)
values (1, '���� ��������'),
       (2, '����������� �� 2 ��� �� �������'),
       (3, '�� ����� ����� 30 ���� (����)');
set identity_insert dbo.M_SMS_TEMPLATE_TYPE off;

GO