/* установить права сотрудникам так, чтобы они не привышали директорские */

if exists(select 1 from sys.procedures as a where a.name = 'SET_RIGHTS_AFTER_DIREKTOR_EDIT') drop procedure dbo.SET_RIGHTS_AFTER_DIREKTOR_EDIT;

GO

/*
  после редактирования директора в организации, его права могут быть уменьшены,
  ни у одного сотрудника не должно остаться таких прав, которых нет у директора
  директоров может быть много, важно, чтобы если ни у одного из директоров права
  нет, то и у сотрудника быть не должно, так же надо учитывать, что в данный
  момент организации может принадлежать сотрудник администрации, если он выполнил
  вход в данную организацию, его надо исключить, потому что у него будут все
  возможные права
  так же не надо пересчитывать права организации Администрации
*/
create procedure [dbo].[SET_RIGHTS_AFTER_DIREKTOR_EDIT]
	-- организация
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


-- для администрации ничего не делаем
declare @m_org_type_id int;
select @m_org_type_id = m.M_ORG_TYPE_ID  from dbo.M_ORG m where m.ID = @m_org_id;
if (@m_org_type_id = @M_ORG_TYPE_ID_ADMINISTRATSIYA) begin
  return;
end;

-- если в организации нет ниодного директора - тоже ничего не делаю
create table #dirId (id int not null);
insert into #dirId(id)
select
  u.ID
from 
  dbo.S_USER u
where
  u.M_ORG_ID = @m_org_id
  -- не беру пользователей администрации, которые временно находятся
  -- внутри данной организации, зашли посмотреть на этот салон
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
  raiserror('В организации не осталось ни одного директора', 16, 1);
end;



-- если директора есть, то получаю все их права и у простых пользователей
-- удаляю лишние
--
-- простые пользователи организации
create table #usrId (id int not null);
insert into #usrId(id)
select
  u.ID
from 
  dbo.S_USER u
where
  u.M_ORG_ID = @m_org_id
  -- не беру пользователей администрации, которые временно находятся
  -- внутри данной организации, зашли посмотреть на этот салон
  and isnull(u.IS_ADM, 0) = 0
  and u.S_USER_ROLE_ID != @S_USER_ROLE_ID_DIRECTOR
;
--
-- права на группу
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
  -- на всякий случай
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
-- права на режим
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
  -- на всякий случай
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
-- права на режим можно не только удалить у директора, но
-- и закрыть ему доступ на редактирование какого-то режима,
-- тогда надо и у всех простых пользователей это право закрыть
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
  -- на всякий случай
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
