if exists(select 1 from sys.procedures as a where a.name = 'GET_DIALOG_INFO') drop procedure dbo.GET_DIALOG_INFO;

GO

create procedure [dbo].[GET_DIALOG_INFO]
	@o_ank_id int
as begin
	declare 
		@visits int,
		@min_date smalldatetime, @max_date smalldatetime, 
		@min_seans_time_id int, @max_seans_time_id int,
		@first_visit varchar(100), @last_visit varchar(100),
		@days int = 0, @months int = 0, @nepreryv varchar(100),
		@m_org_id int;

		select @m_org_id = a.M_ORG_ID from dbo.O_ANK a where a.ID = @o_ank_id;

		if (@m_org_id is null) begin
			declare @err varchar(500);
			set @err = 'ќшибка при определении M_ORG_ID дл€ O_ANK_ID = ' + cast(@o_ank_id as varchar(500));
			raiserror(@err, 15, 1);
		end;
		
	if object_id('tempdb..#month') is not null drop table #month;
	select *
		into #month 
		from ( 
			select	1	  id, '€нвар€' name	union all
			select	2	  id, 'феврал€' name union all
			select	3	  id, 'марта' name union all
			select	4	  id, 'апрел€' name	union all
			select	5	  id, 'ма€' name union all
			select	6	  id, 'июн€' name	union all
			select	7	  id, 'июл€' name	union all
			select	8	  id, 'августа' name union all
			select	9	  id, 'сент€бр€' name union all
			select	10	id, 'окт€бр€' name union all
			select	11	id, 'но€бр€' name	union all
			select	12	id, 'декабр€' name
	) a;
					
	set @min_date = (select min(s.D_REG) from o_seans s where o_ank_id = @o_ank_id and seans_state = 1);										
	set @min_seans_time_id = (select min(m_seans_time_id) from o_seans s
	                          where 
														  cast(s.D_REG as date) <= cast(@min_date as date)
															and s.O_ANK_ID = @o_ank_id);
	
	set @first_visit = cast(datepart(day, @min_date) as varchar(2)) + ' ' + 
										 (select min(name) from #month where id = datepart(month, @min_date)) + ' ' +
										 cast(datepart(year, @min_date) as varchar(4)) + ' ' +
										 (select min(min_time) from m_seans_time where id = @min_seans_time_id);
	
	set @max_date = (select max(s.D_REG) from o_seans s where o_ank_id = @o_ank_id and seans_state = 1);										
	set @max_seans_time_id = (select max(m_seans_time_id) from o_seans s
	                          where
														  cast(s.D_REG as date) <= cast(@max_date as date)
															and s.O_ANK_ID = @o_ank_id);
	
	set @last_visit = cast(datepart(day, @max_date) as varchar(2)) + ' ' + 
										(select max(name) from #month where id = datepart(month, @max_date)) + ' ' +
										cast(datepart(year, @max_date) as varchar(4)) + ' ' +
										(select max(min_time) from m_seans_time where id = @max_seans_time_id);
	
	set @visits = (select count(*)
									 from o_seans o
									where o.o_ank_id = @o_ank_id
										and cast(o.D_REG as date) <= cast(dbo.CREATE_DATE(@m_org_id) as date)
										and o.seans_state = 1);
										
	set @days = @visits;
	
	-- мес€ц - 22 рабочих дн€
	if (@days > 22) begin
		set @months = @days / 22;
		set @days = @days % 22;
	end;
	
	if (@days > 0) begin
		set @nepreryv = '’одит ';
		if (@months > 0) begin
			set @nepreryv = @nepreryv +
					case
						when @months = 5 or @months % 10 = 5 or @months between 11 and 20 then cast(@months as varchar(3)) + ' мес€цев '
						when @months = 1 or @months % 10 = 1 then cast(@months as varchar(3)) + ' мес€ц '
						when @months in (2, 3, 4) or @months % 10 in (2, 3, 4) then cast(@months as varchar(3)) + ' мес€ца '
					end;
		end;
		set @nepreryv = @nepreryv +
				case
					when @days = 5 or @days % 10 = 5 or @days between 11 and 20 then cast(@days as varchar(3)) + ' дней '
					when @days = 1 or @days % 10 = 1 then cast(@days as varchar(3)) + ' день '
					when @days in (2, 3, 4) or @days % 10 in (2, 3, 4) then cast(@days as varchar(3)) + ' дн€ '
				end;
	end;
	
	select @visits visits,
				 @first_visit first_visit,
				 @last_visit last_visit,
				 @nepreryv nepreryv,
 				 (select replace(replace(replace(substring(buzz, 2, 20000),'</name><name>',', '),'</name>',''),'name>','')
					  from (select name
									  from m_zabol z
									  join o_ank_zabol a on a.m_zabol_id = z.id and a.o_ank_id = @o_ank_id
								  for xml path ('')) fizz(buzz)) zabol;
end;

go

exec [dbo].[GET_DIALOG_INFO] @o_ank_id = 2;