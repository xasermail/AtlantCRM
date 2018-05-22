/* Учёт - Отчёты - Отчёт за период */

if exists(select 1 from sys.procedures as a where a.name = 'GET_UCHET_REPORTS_OTCHET_ZA_PER') drop procedure dbo.GET_UCHET_REPORTS_OTCHET_ZA_PER;

GO

create procedure [dbo].[GET_UCHET_REPORTS_OTCHET_ZA_PER]
  @m_org_id int,
  @year int
as begin

set datefirst 1;
set nocount on;
set ansi_warnings off;


if object_id('tempdb..#tmonth') is not null drop table #tmonth;
create table #tmonth(
  id int identity not null primary key,
  month_num int not null,
  month_name varchar(500) not null
);
insert into #tmonth(month_num, month_name) values (1, 'Январь'), (2, 'Февраль'), (3, 'Март'), (4, 'Апрель'), (5, 'Май'), (6, 'Июнь'), (7, 'Июль'), (8, 'Август'), (9, 'Сентябрь'), (10, 'Октябрь'), (11, 'Ноябрь'), (12, 'Декабрь');

if object_id('tempdb..#report') is not null drop table #report;
create table #report(
  id int not null identity primary key,
  month_num as id + 0,
  tovaroob decimal(18,2),
  sebest decimal(18,2),
  brutto_pr decimal(18,2),
  rashod decimal(18,2),
  chist_pr decimal(18,2),
  rent decimal(18,2),
  valov_dohod decimal(18,2),
  tochka_bezub decimal(18,2)
);

declare @i int = 1;
declare @date0 smalldatetime;
declare @date1 smalldatetime;
while (@i <= 12) begin
  set @date0 = datefromparts(@year, @i, 1);
  set @date1 = eomonth(@date0);
  insert into #report(tovaroob, sebest, brutto_pr, rashod, chist_pr, rent, valov_dohod, tochka_bezub)
  exec dbo.GET_OTCHET_BUH_DATA @m_org_id = @m_org_id, @date0 = @date0, @date1 = @date1;
  set @i = @i + 1;
end;


select
  r.*,
  m.month_name
from
  #report r
  join #tmonth m on r.month_num = m.month_num
;


if object_id('tempdb..#tmonth') is not null drop table #tmonth;
if object_id('tempdb..#report') is not null drop table #report;

end;

go


set dateformat dmy;
exec dbo.GET_UCHET_REPORTS_OTCHET_ZA_PER @m_org_id = 1, @year = 2017;