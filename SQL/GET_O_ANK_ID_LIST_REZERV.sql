/* забронировать указанное количество ID для анкеты O_ANK */ 

if exists(select 1 from sys.procedures as a where a.name = 'GET_O_ANK_ID_LIST_REZERV') drop procedure dbo.GET_O_ANK_ID_LIST_REZERV;
if exists(select 1 from sys.procedures as a where a.name = 'GET_O_ANK_ID') drop procedure dbo.GET_O_ANK_ID;

GO

create procedure [dbo].[GET_O_ANK_ID_LIST_REZERV]
	@kolvo int = 0 as
begin
	declare @i int = 1;
	if object_id('tempdb..#data') is not null drop table #data;
	create table #data (id int);

	while(@i <= @kolvo) begin
		insert #data
		select cast(next value for dbo.SQ_O_ANK_ID as int);
		set @i = @i + 1;
	end;

	select * from #data;
	if object_id('tempdb..#data') is not null drop table #data;
end;

GO

-- exec [dbo].[GET_O_ANK_ID_LIST_REZERV] @kolvo = 100;

GO