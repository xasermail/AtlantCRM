/* ���������� ����� ����������� ���, ����� ��� �� ��������� ������������ */

if exists(select 1 from sys.procedures as a where a.name = 'SET_RIGHTS_AFTER_DIREKTOR_EDIT') drop procedure dbo.SET_RIGHTS_AFTER_DIREKTOR_EDIT;

GO

/*
  ����� �������������� ��������� � �����������, ��� ����� ����� ���� ���������,
  �� � ������ ���������� �� ������ �������� ����� ����, ������� ��� � ���������
  ���������� ����� ���� �����, �����, ����� ���� �� � ������ �� ���������� �����
  ���, �� � � ���������� ���� �� ������, ��� �� ���� ���������, ��� � ������
  ������ ����������� ����� ������������ ��������� �������������, ���� �� ��������
  ���� � ������ �����������, ��� ���� ���������, ������ ��� � ���� ����� ���
  ��������� �����
  ��� �� �� ���� ������������� ����� ����������� �������������
*/
create procedure [dbo].[SET_RIGHTS_AFTER_DIREKTOR_EDIT]
	-- �����������
	@m_org_id int
as begin

set datefirst 1;
set nocount on;
set ansi_warnings off;

DECLARE @M_ORG_TYPE_ID_ADMINISTRATSIYA INT = 1;
DECLARE @M_ORG_TYPE_ID_DILER_A INT = 2;
DECLARE @M_ORG_TYPE_ID_DILER_C INT = 3;
DECLARE @M_ORG_TYPE_ID_DILER_D INT = 4;

DECLARE @S_USER_ROLE_ID_DIRECTOR INT = 5;


-- ��� ������������� ������ �� ������
declare @m_org_type_id int;
select @m_org_type_id = m.M_ORG_TYPE_ID  from dbo.M_ORG m where m.ID = @m_org_id;
if (@m_org_type_id = @M_ORG_TYPE_ID_ADMINISTRATSIYA) begin
  return;
end;

-- ���� � ����������� ��� �������� ��������� - ���� ������ �� �����
create table #dirId (id int not null);
insert into #dirId(id)
select
  u.ID
from 
  dbo.S_USER u
where
  u.M_ORG_ID = @m_org_id
  -- �� ���� ������������� �������������, ������� �������� ���������
  -- ������ ������ �����������, ����� ���������� �� ���� �����
  and isnull(u.IS_ADM, 0) = 0
  and u.S_USER_ROLE_ID = @S_USER_ROLE_ID_DIRECTOR
;
if (
  not exists(
    select
      *
    from 
      #dirId
  )
)
begin
  raiserror('� ����������� �� �������� �� ������ ���������', 16, 1);
end;



-- ���� ��������� ����, �� ������� ��� �� ����� � � ������� �������������
-- ������ ������
--
-- ������� ������������ �����������
create table #usrId (id int not null);
insert into #usrId(id)
select
  u.ID
from 
  dbo.S_USER u
where
  u.M_ORG_ID = @m_org_id
  -- �� ���� ������������� �������������, ������� �������� ���������
  -- ������ ������ �����������, ����� ���������� �� ���� �����
  and isnull(u.IS_ADM, 0) = 0
  and u.S_USER_ROLE_ID != @S_USER_ROLE_ID_DIRECTOR
;
--
-- ����� �� ������
create table #pravaGr(m_pravo_gr_id int);
insert into #pravaGr(m_pravo_gr_id)
select distinct
  g.M_PRAVO_GR_ID
from
  dbo.O_PRAVO_GR g
where
  g.S_USER_ID in (
    select i.id from #dirId i
  )
  -- �� ������ ������
  and g.M_PRAVO_GR_ID is not null
;
delete
  g
from
  dbo.O_PRAVO_GR g
where
  g.S_USER_ID in (
    select i.id from #usrId i
  )
  and g.M_PRAVO_GR_ID not in (
    select o.m_pravo_gr_id from #pravaGr o
  )
;
--
-- ����� �� �����
create table #pravaRej(m_pravo_rej_id int);
insert into #pravaRej(m_pravo_rej_id)
select distinct
  r.M_PRAVO_REJ_ID
from
  dbo.O_PRAVO_REJ r
where
  r.S_USER_ID in (
    select i.id from #dirId i
  )
  -- �� ������ ������
  and r.M_PRAVO_REJ_ID is not null
;
delete
  r
from
  dbo.O_PRAVO_REJ r
where
  r.S_USER_ID in (
    select i.id from #usrId i
  )
  and r.M_PRAVO_REJ_ID not in (
    select o.m_pravo_rej_id from #pravaRej o
  )
;
--
-- ����� �� ����� ����� �� ������ ������� � ���������, ��
-- � ������� ��� ������ �� �������������� ������-�� ������,
-- ����� ���� � � ���� ������� ������������� ��� ����� �������
create table #pravaRejWrite(m_pravo_rej_id int);
insert into #pravaRejWrite(m_pravo_rej_id)
select distinct
  r.M_PRAVO_REJ_ID
from
  dbo.O_PRAVO_REJ r
where
  r.WRITE1 = 1
  and r.S_USER_ID in (
    select i.id from #dirId i
  )
  -- �� ������ ������
  and r.M_PRAVO_REJ_ID is not null
;
update
  r
set
  r.WRITE1 = 0
from
  dbo.O_PRAVO_REJ r
  join #usrId u on r.S_USER_ID = u.id
where
  r.WRITE1 = 1
  and not exists(
    select
      *
    from
      #pravaRejWrite w
    where
      r.M_PRAVO_REJ_ID = w.m_pravo_rej_id
  )
;
  
end;

--go


--set dateformat dmy;
--exec dbo.GET_BAZA_LIST @page = 1, @rows_per_page = 300, @m_org_id = 2, @fio = '', @periodHodit = 2, @periodDn = 5, @zabolId = 0;
--exec dbo.GET_BAZA_LIST @page = 1, @rows_per_page = 300, @m_org_id = 2, @fio = '', @periodHodit = 1, @periodDn = 5, @zabolId = 0,  @posS = '16.01.2017', @posPo = '16.01.2017';
--exec dbo.GET_BAZA_LIST @page = 1, @rows_per_page = 300, @m_org_id = 2, @fio = '', @periodHodit = 0, @periodDn = 0
--exec dbo.GET_BAZA_LIST @page = 1, @rows_per_page = 300, @m_org_id = 2, @fio = '', @periodHodit = 0, @periodDn = 0, @zabolId = 369, @posS = '16.01.2017', @posPo = '17.01.2017';



-- select * from dbo.o_seans where o_ank_id = 224
