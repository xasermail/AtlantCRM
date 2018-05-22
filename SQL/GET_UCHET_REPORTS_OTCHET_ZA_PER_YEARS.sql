/* Учёт - Отчёты - Отчёт за период получение доступных для выбора годов формирования отчета*/

if exists(select 1 from sys.procedures as a where a.name = 'GET_UCHET_REPORTS_OTCHET_ZA_PER_YEARS') drop procedure dbo.GET_UCHET_REPORTS_OTCHET_ZA_PER_YEARS;

GO

create procedure [dbo].[GET_UCHET_REPORTS_OTCHET_ZA_PER_YEARS]
  @m_org_id int
as begin

set datefirst 1;
set nocount on;
set ansi_warnings off;


select a.y
	from (
		select distinct year(r.D_SCHET) y from dbo.O_SKLAD_PR r where r.M_ORG_ID = @m_org_id
		union
		select distinct year(r.D_SCHET) from dbo.O_SKLAD_RAS r where r.M_ORG_ID = @m_org_id
		union
		select distinct year(s.D_REG) y from dbo.O_SEANS s where s.M_ORG_ID = @m_org_id) a
 where a.y is not null
 order by a.y
end;