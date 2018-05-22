/* Учёт - Отчёты - Отчёт за период получение доступных для выбора годов формирования отчета*/

if exists(select 1 from sys.procedures as a where a.name = 'GET_DILER_A_MARKETING_KALEND_YEARS') drop procedure dbo.GET_DILER_A_MARKETING_KALEND_YEARS;

GO

create procedure [dbo].[GET_DILER_A_MARKETING_KALEND_YEARS]
  @m_org_id int as 
begin
	set datefirst 1;
	set nocount on;
	set ansi_warnings off;

	if object_id('tempdb..#data') is not null drop table #data;
	if object_id('tempdb..#temp') is not null drop table #temp;

	-- салоны дилера А
	select ID into #temp from dbo.M_ORG m where m.PARENT_ID = @m_org_id;

	select *
		into #data from (
			select ID from dbo.M_ORG m where m.PARENT_ID in (select ID from #temp)
			union
			select ID from #temp
		) a;


	select a.y
		from (
			select distinct year(r.D_SCHET) y from dbo.O_SKLAD_PR r where r.M_ORG_ID in (select ID from #data)
			union
			select distinct year(r.D_SCHET) y from dbo.O_SKLAD_RAS r where r.M_ORG_ID in (select ID from #data)
			union
			select distinct year(s.D_REG) y from dbo.O_SEANS s where s.M_ORG_ID in (select ID from #data)
		) a
	 where a.y is not null
	 order by a.y;

	 if object_id('tempdb..#data') is not null drop table #data;
	 if object_id('tempdb..#temp') is not null drop table #temp;
end;