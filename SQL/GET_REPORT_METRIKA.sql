/* Учёт - Отчёты - Отчёт за период */

if exists(select 1 from sys.procedures as a where a.name = 'GET_REPORT_METRIKA') drop procedure dbo.GET_REPORT_METRIKA;

GO

create procedure [dbo].[GET_REPORT_METRIKA]
  @m_org_id int
as begin
	if object_id('tempdb..#org') is not null drop table #org;
	if object_id('tempdb..#tmp') is not null drop table #tmp;
	if object_id('tempdb..#buf') is not null drop table #buf;
	if object_id('tempdb..#stat') is not null drop table #stat;
	if object_id('tempdb..#now') is not null drop table #now;
	
	declare @date0 smalldatetime, @date1 smalldatetime, @org_id int,
					@dohod numeric(15,2), @vsego int, @sred numeric(15,2), @novyh int, @cnt int, 
					@cnt_now int, @vsego_now int;
	
	create table #org(
		ID int,
		NAME varchar(500),
		VALOV_DOHOD numeric(15,2),
		NOVYH int,
		SRED int,
		VSEGO numeric(15,2)
	);
	
	create table #buf(
		tovaroob decimal(18,2),
		sebest decimal(18,2),
		brutto_pr decimal(18,2),
		rashod decimal(18,2),
		chist_pr decimal(18,2),
		rent decimal(18,2),
		valov_dohod decimal(18, 2),
		tochka_bezub decimal(18, 2)
	);
	
	create table #stat(
		CNT int,
		NEW int
	);

	create table #now(
		CNT int,
		NEW int
	);

	create table #tmp(
		ID int,
		NAME varchar(1000),
		D_PERIOD_S smalldatetime,
		D_PERIOD_PO smalldatetime
	);

	insert into #tmp
	select d.ID,
				 d.NAME,
				 k.D_PERIOD_S,
				 k.D_PERIOD_PO 
		from (
			-- зашел дилер А
			select a.ID DILER_A_ID, c.ID DILER_C_ID
				from dbo.M_ORG a
				join dbo.M_ORG c on c.PARENT_ID = a.ID and c.M_ORG_TYPE_ID = 3 and a.M_ORG_TYPE_ID = 2
			 where a.ID = @m_org_id and a.DEISTV = 1 and c.DEISTV = 1
		 	union
			-- зашел Дилер С Дилера А
			select a.ID DILER_A_ID, c.ID DILER_C_ID
				from dbo.M_ORG c
				join dbo.M_ORG a on c.PARENT_ID = a.ID and c.M_ORG_TYPE_ID = 3 and a.M_ORG_TYPE_ID = 2
			 where c.ID = @m_org_id and a.DEISTV = 1 and c.DEISTV = 1
			union
			-- зашел Дилер Д Дилера А
			select a.ID DILER_A_ID, null DILER_C_ID
				from dbo.M_ORG d
				join dbo.M_ORG a on d.PARENT_ID = a.ID and d.M_ORG_TYPE_ID = 4 and a.M_ORG_TYPE_ID = 2
			 where d.ID = @m_org_id and a.DEISTV = 1
			union
			-- зашел Дилер Д Дилера С Дилера А
			select a.ID DILER_A_ID, ac.ID DILER_C_ID
				from dbo.M_ORG d
				join dbo.M_ORG c on c.ID = d.PARENT_ID and c.M_ORG_TYPE_ID = 3 and d.M_ORG_TYPE_ID = 4
				join dbo.M_ORG a on c.PARENT_ID = a.ID and c.M_ORG_TYPE_ID = 3 and a.M_ORG_TYPE_ID = 2
				join dbo.M_ORG ac on ac.PARENT_ID = a.ID and ac.M_ORG_TYPE_ID = 3 and a.M_ORG_TYPE_ID = 2
			 where d.ID = @m_org_id and a.DEISTV = 1 and c.DEISTV = 1
		) a
 		join dbo.O_KALEN_PROD k on a.DILER_A_ID = k.M_ORG_ID
		join dbo.M_ORG d on d.PARENT_ID = a.DILER_A_ID or d.PARENT_ID = a.DILER_C_ID
	 where k.GOD = Year(getdate())
		 and k.MES = Month(getdate())
		 and d.M_ORG_TYPE_ID = 4
		 and d.DEISTV = 1;

		 
	while (exists(select * from #tmp)) begin
		set @org_id = (select top 1 ID from #tmp);
		set @date0 = (select top 1 D_PERIOD_S from #tmp where ID = @org_id);
		set @date1 = (select top 1 D_PERIOD_PO from #tmp where ID = @org_id);
		
		insert into #buf
		EXEC [dbo].[GET_OTCHET_BUH_DATA] @org_id, @date0, @date1;
		
		insert into #stat
		select count(*) CNT,
					 (select sum(1) from O_ANK a where a.M_ORG_ID = @org_id and cast(s.D_REG as date) = cast(a.DATE_REG as date)) NEW
			from O_SEANS s
		 where cast(s.D_REG as date) between cast(@date0 as date) and cast(@date1 as date)
			 and s.M_ORG_ID = @org_id
		 group by cast(s.D_REG as date)
		 having count(*) > 0
		 order by cast(s.D_REG as date) asc;
		
		insert into #now
		select count(*) CNT,
					 (select sum(1) from O_ANK a where a.M_ORG_ID = @org_id and cast(s.D_REG as date) = cast(a.DATE_REG as date)) NEW
			from O_SEANS s
		 where cast(s.D_REG as date) between cast(getdate() as date) and cast(getdate() as date)
			 and s.M_ORG_ID = @org_id
		 group by cast(s.D_REG as date)
		 having count(*) > 0
		 order by cast(s.D_REG as date) asc;

		set @novyh = (select sum(new) from #now);
		set @novyh = case when @novyh = 0 then null else @novyh end;
		
		set @vsego = (select sum(cnt) from #stat);
		set @vsego = case when @vsego = 0 then null else @vsego end;
		
		set @cnt = (select count(*) from #stat);
		set @cnt = case when @cnt = 0 then null else @cnt end;

		select @vsego_now = sum(cnt), @cnt_now = count(*) from #now;
		
		set @vsego_now = @vsego_now / @cnt_now;
		set @sred = cast(@vsego as float) / cast(@cnt as float);
		
		insert into #org
		select ID,
					 NAME,
					 (select top 1 valov_dohod from #buf),
					 @novyh,
					 @vsego_now,
					 round(@sred,2)
			from #tmp where ID = @org_id;
			
		delete from #tmp where ID = @org_id;
		truncate table #buf;
		truncate table #stat;
		truncate table #now;
	end;

	select * from #org order by VALOV_DOHOD desc;
end;

go


set dateformat dmy;
exec dbo.GET_REPORT_METRIKA @m_org_id = 26;